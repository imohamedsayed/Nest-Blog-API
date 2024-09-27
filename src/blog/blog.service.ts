import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BlogService {
  constructor(private db: DatabaseService) {}

  async create(createBlogDto: CreateBlogDto, userId: number) {
    const blog = await this.db.blog.create({
      data: {
        ...createBlogDto,
        userId,
      },
    });

    return blog;
  }

  async findAll() {
    const blogs = await this.db.blog.findMany();
    return blogs;
  }

  async findOne(id: number) {
    const blog = await this.db.blog.findUnique({
      where: { id },
    });
    if (blog) return blog;

    throw new NotFoundException('Blog not found');
  }

  async update(id: number, updateBlogDto: UpdateBlogDto, userId: number) {
    const blog = await this.db.blog.findUnique({ where: { id } });

    if (!blog) throw new NotFoundException('blog not found');

    if (blog.userId != userId)
      throw new ForbiddenException('Access to update resource denied');

    const updatedBlog = await this.db.blog.update({
      where: { id },
      data: { ...updateBlogDto },
    });

    return updatedBlog;
  }

  async remove(id: number, userId: number) {
    const blog = await this.db.blog.findUnique({ where: { id } });

    if (!blog) throw new NotFoundException('blog not found');

    if (blog.userId != userId)
      throw new ForbiddenException('Access to delete resource denied');

    const deletedBlog = await this.db.blog.delete({
      where: { id },
    });

    return deletedBlog;
  }

  async deleteByAdmin(id: number) {
    const blog = await this.db.blog.delete({
      where: { id },
    });

    return blog;
  }
}
