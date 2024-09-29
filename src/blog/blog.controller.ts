import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  Ip,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtGuard } from 'src/auth/guards';
import { GetUser } from 'src/auth/decorator';

import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
@SkipThrottle() // rate limit will not applied for these controller's routes
@UseGuards(JwtGuard)
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  private readonly logger = new MyLoggerService(BlogController.name);

  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @GetUser('id') userId: number) {
    return this.blogService.create(createBlogDto, userId);
  }

  @Get()
  findAll(@Ip() IP: string) {
    this.logger.log(`Request For All Blogs\t${IP}`, BlogController.name);
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }

  @SkipThrottle({ default: false }) // rate limiter will be applied for this route
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @GetUser('id') userId: number,
  ) {
    return this.blogService.update(id, updateBlogDto, userId);
  }

  @Throttle({ short: { ttl: 1000, limit: 1 } }) // overwrite the short limit for this route to be 1 request instead of 3 that defined globally
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    if (user.role == 'ADMIN') return this.blogService.deleteByAdmin(id);
    else return this.blogService.remove(id, user.id);
  }
}
