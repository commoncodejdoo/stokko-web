export class Supplier {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly contactPerson: string | null,
    readonly phone: string | null,
    readonly email: string | null,
    readonly note: string | null,
  ) {}
}
