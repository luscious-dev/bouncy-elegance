class APIFeatures {
  constructor(query, queryParamsObj) {
    this.query = query;
    this.queryParamsObj = queryParamsObj;
  }

  filter() {
    const queryObj = { ...this.queryParamsObj };
    const excludeParams = ["sort", "fields", "page", "limit"];
    excludeParams.forEach((param) => delete queryObj[param]);
    this.query = this.query.find(queryObj);
    return this;
  }

  paginate() {
    const page = this.queryParamsObj.page * 1 || 1;
    const limit = this.queryParamsObj.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  sort() {
    if (this.queryParamsObj.sort) {
      const sortString = queryParamsObj.sort.split(",").join(" ");
      this.query = this.query.sort(sortString);
    } else {
      this.query = this.query.sort("-createdDate");
    }
    return this;
  }

  limitFields() {
    if (this.queryParamsObj.fields) {
      const fieldString = this.queryParamsObj.fields.split(",").join(" ");
      this.query = this.query.select(fieldString);
    } else {
      this.query = this.query.select("-__v -slug");
    }
    return this;
  }
}

module.exports = APIFeatures;
