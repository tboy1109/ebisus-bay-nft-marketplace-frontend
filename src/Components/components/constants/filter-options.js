import { FilterOption } from '../../Models/filter-option.model';
import config from '../../../Assets/networks/rpc_config.json';

const knownContracts = config.known_contracts;

export const collectionFilterOptions = knownContracts
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((x) => FilterOption.fromJson(x));

export const marketPlaceCollectionFilterOptions = knownContracts
  .filter((c) => c.listable)
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((x) => FilterOption.fromJson(x));
