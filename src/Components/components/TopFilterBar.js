import React, { memo } from 'react';
import Select from 'react-select';
import { SortOption } from '../Models/sort-option.model';
import { FilterOption } from '../Models/filter-option.model';

const TopFilterBar = ({
  showFilter = true,
  showSort = true,
  sortOptions = [],
  filterOptions = [],
  defaultSortValue = SortOption.default(),
  defaultFilterValue = FilterOption.default(),
  filterPlaceHolder = '',
  sortPlaceHolder = '',
  onFilterChange = () => {},
  onSortChange = () => {},
  sortValue = undefined,
  filterValue = undefined,
}) => {
  const customStyles = {
    option: (base, state) => ({
      ...base,
      background: '#fff',
      color: '#333',
      borderRadius: state.isFocused ? '0' : 0,
      '&:hover': {
        background: '#eee',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 0,
      marginTop: 0,
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
    }),
    control: (base, state) => ({
      ...base,
      padding: 2,
    }),
  };

  return (
    <div className="items_filter">
      {showFilter && (
        <div className="dropdownSelect one">
          <Select
            styles={customStyles}
            placeholder={filterPlaceHolder}
            options={filterOptions}
            getOptionLabel={(option) => option.getOptionLabel}
            getOptionValue={(option) => option.getOptionValue}
            defaultValue={defaultFilterValue}
            value={filterValue}
            onChange={onFilterChange}
          />
        </div>
      )}
      {showSort && (
        <div className="dropdownSelect two">
          <Select
            styles={customStyles}
            placeholder={sortPlaceHolder}
            options={sortOptions}
            getOptionLabel={(option) => option.getOptionLabel}
            getOptionValue={(option) => option.getOptionValue}
            defaultValue={defaultSortValue}
            value={sortValue}
            onChange={onSortChange}
          />
        </div>
      )}
    </div>
  );
};

export default memo(TopFilterBar);
