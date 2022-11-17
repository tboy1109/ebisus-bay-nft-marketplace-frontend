import React, { memo, useEffect, useState } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { humanize } from '../../utils';
import { filterListingsByTrait } from '../../GlobalState/collectionSlice';
import './Filters.css';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

const TraitsFilter = ({ address }) => {
  const dispatch = useDispatch();

  const collectionStats = useSelector((state) => state.collection.stats);
  const collectionCachedTraitsFilter = useSelector((state) => state.collection.cachedTraitsFilter);

  const [hideAttributes, setHideAttributes] = useState(window.innerWidth < 768);

  const viewTraitsList = () => {
    if (!collectionStats || !collectionStats.traits) {
      return [];
    }

    return Object.entries(collectionStats.traits);
  };

  const viewSelectedAttributesCount = () => {
    const cachedTraitsFilter = collectionCachedTraitsFilter[address] || {};
    return Object.values(cachedTraitsFilter)
      .map((traitCategoryValue) => Object.values(traitCategoryValue).filter((x) => x === true).length)
      .reduce((prev, curr) => prev + curr, 0);
  };

  const traitStatName = (name, stats) => {
    let ret = humanize(name);
    if (stats && stats.count > 0) {
      ret = ret.concat(` (${stats.count})`);
    }

    return ret;
  };

  const viewGetDefaultCheckValue = (traitCategory, id) => {
    const cachedTraitsFilter = collectionCachedTraitsFilter[address] || {};

    if (!cachedTraitsFilter || !cachedTraitsFilter[traitCategory]) {
      return false;
    }

    return cachedTraitsFilter[traitCategory][id] || false;
  };

  const clearAttributeFilters = () => {
    const inputs = document.querySelectorAll('.attribute-checkbox input[type=checkbox]');
    for (const item of inputs) {
      item.checked = false;
    }
    dispatch(
      filterListingsByTrait({
        traits: {},
        address,
      })
    );
  };

  const handleCheck = (event, traitCategory) => {
    const { id, checked } = event.target;

    const cachedTraitsFilter = collectionCachedTraitsFilter[address] || {};

    dispatch(
      filterListingsByTrait({
        traits: {
          ...cachedTraitsFilter,
          [traitCategory]: {
            ...(cachedTraitsFilter[traitCategory] || {}),
            [id]: checked,
          },
        },
        address,
      })
    );
  };

  useEffect(() => {
    const container = document.getElementById('traits');
    if (container) {
      container.style.display = hideAttributes ? 'none' : 'block';
    }
  }, [hideAttributes]);

  return (
    <>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-middle">
          <h3
            className="d-inline-block"
            onClick={() => setHideAttributes(!hideAttributes)}
            style={{ cursor: 'pointer', marginBottom: 0 }}
          >
            Attributes
          </h3>

          <div className="d-inline-block fst-italic my-auto me-2" style={{ fontSize: '0.8em', cursor: 'pointer' }}>
            <FontAwesomeIcon id="traits-expand-icon" icon={hideAttributes ? faPlus : faMinus} />
          </div>
        </div>
        {viewSelectedAttributesCount() > 0 && (
          <div className="d-flex justify-content-between align-middle">
            <span>{viewSelectedAttributesCount()} selected</span>
            <div
              className="d-inline-block fst-italic my-auto"
              style={{ fontSize: '0.8em', cursor: 'pointer' }}
              onClick={clearAttributeFilters}
            >
              Clear
            </div>
          </div>
        )}
      </div>
      <Accordion id="traits" className={hideAttributes ? 'd-none' : ''}>
        {viewTraitsList()
            .sort((a, b) => (a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1))
            .map(([traitCategoryName, traitCategoryValues], key) => (
          <Accordion.Item eventKey={key} key={key}>
            <Accordion.Header>{humanize(traitCategoryName)}</Accordion.Header>
            <Accordion.Body>
              {Object.entries(traitCategoryValues)
                .filter((t) => t[1].count > 0)
                .sort((a, b) => {
                  if (!isNaN(a[0]) && !isNaN(b[0])) {
                    return (parseInt(a[0]) > parseInt(b[0]) ? 1 : -1)
                  }
                  return (a[0] > b[0] ? 1 : -1)
                })
                .map((stats) => (
                  <div key={`${traitCategoryName}-${stats[0]}`}>
                    <Form.Check
                      type="checkbox"
                      id={stats[0]}
                      className="attribute-checkbox"
                      label={traitStatName(stats[0], stats[1])}
                      defaultChecked={viewGetDefaultCheckValue(traitCategoryName, stats[0])}
                      value={viewGetDefaultCheckValue(traitCategoryName, stats[0])}
                      onChange={(t) => handleCheck(t, traitCategoryName)}
                    />
                  </div>
                ))}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
};

export default memo(TraitsFilter);
