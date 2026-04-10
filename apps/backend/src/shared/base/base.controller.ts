import { Body, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { BaseCrudService } from "./base-crud.service";
import { PageQueryDto } from "../dto/page-query.dto";

export abstract class BaseController<
  TEntity,
  TCreate extends Record<string, unknown>,
  TUpdate extends Record<string, unknown>,
  TListQuery extends Record<string, unknown> = Record<string, unknown>,
> {
  protected constructor(
    protected readonly service: BaseCrudService<TEntity, TCreate, TUpdate, TListQuery>,
  ) {}

  @Get()
  list(@Query() query: TListQuery | PageQueryDto) {
    return this.service.list(query as TListQuery);
  }

  @Post()
  create(@Body() body: TCreate) {
    return this.service.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: TUpdate) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
