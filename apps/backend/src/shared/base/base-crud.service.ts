export abstract class BaseCrudService<
  TEntity,
  TCreate extends Record<string, unknown>,
  TUpdate extends Record<string, unknown>,
  TListQuery extends Record<string, unknown> = Record<string, unknown>,
> {
  async list(query?: TListQuery): Promise<TEntity[]> {
    await this.beforeList(query);
    const result = await this.doList(query);
    await this.afterList(result, query);
    return result;
  }

  async create(data: TCreate): Promise<TEntity> {
    await this.beforeCreate(data);
    const result = await this.doCreate(data);
    await this.afterCreate(result, data);
    return result;
  }

  async update(id: string, data: TUpdate): Promise<TEntity> {
    await this.beforeUpdate(id, data);
    const result = await this.doUpdate(id, data);
    await this.afterUpdate(result, id, data);
    return result;
  }

  async remove(id: string): Promise<TEntity> {
    await this.beforeDelete(id);
    const result = await this.doDelete(id);
    await this.afterDelete(result, id);
    return result;
  }

  protected abstract doList(query?: TListQuery): Promise<TEntity[]>;
  protected abstract doCreate(data: TCreate): Promise<TEntity>;
  protected abstract doUpdate(id: string, data: TUpdate): Promise<TEntity>;
  protected abstract doDelete(id: string): Promise<TEntity>;

  // Hook methods for domain-specific checks/side effects.
  protected async beforeList(_query?: TListQuery): Promise<void> {}
  protected async afterList(_result: TEntity[], _query?: TListQuery): Promise<void> {}
  protected async beforeCreate(_data: TCreate): Promise<void> {}
  protected async afterCreate(_result: TEntity, _data: TCreate): Promise<void> {}
  protected async beforeUpdate(_id: string, _data: TUpdate): Promise<void> {}
  protected async afterUpdate(_result: TEntity, _id: string, _data: TUpdate): Promise<void> {}
  protected async beforeDelete(_id: string): Promise<void> {}
  protected async afterDelete(_result: TEntity, _id: string): Promise<void> {}
}
