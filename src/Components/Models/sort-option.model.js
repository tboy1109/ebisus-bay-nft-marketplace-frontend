export class SortOption {
  label = 'None';
  key = null;
  direction = null;

  get getOptionLabel() {
    return this.label;
  }

  get getOptionValue() {
    return this.key;
  }

  static fromJson({ key, direction, label }) {
    const sortOption = new SortOption();

    sortOption.key = key;
    sortOption.direction = direction;
    sortOption.label = label;

    return sortOption;
  }
  static default() {
    return new SortOption();
  }

  toApi() {
    return {
      sortBy: this.key || 'listingId',
      direction: this.direction || 'desc',
    };
  }
}
