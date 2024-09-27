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
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtGuard } from 'src/auth/guards';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @GetUser('id') userId: number) {
    return this.blogService.create(createBlogDto, userId);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @GetUser('id') userId: number,
  ) {
    return this.blogService.update(id, updateBlogDto, userId);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    if (user.role == 'ADMIN') return this.blogService.deleteByAdmin(id);
    else return this.blogService.remove(id, user.id);
  }
}
