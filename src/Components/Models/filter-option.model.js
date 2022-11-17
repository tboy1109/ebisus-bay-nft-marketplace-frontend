export class FilterOption {
  type = 'collection';
  address = null;
  name = 'All';
  id = null;

  get getOptionLabel() {
    return this.name;
  }

  get getOptionValue() {
    return this.address;
  }

  static fromJson({ address, name, id = null }) {
    const filterOption = new FilterOption();

    filterOption.address = address;
    filterOption.name = name;
    filterOption.id = id;

    return filterOption;
  }

  static default() {
    return new FilterOption();
  }

  toApi() {
    if (!this.address || !this.type) {
      return {};
    }

    if (this.address && this.id) {
      return {
        collection: this.address.toLowerCase(),
        tokenId: this.id,
      };
    }
    return {
      [this.type]: this.address.toLowerCase(),
    };
  }
}
