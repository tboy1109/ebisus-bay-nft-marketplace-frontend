import { BigNumber, Contract, ethers } from 'ethers';
import * as Sentry from '@sentry/react';
import config from '../Assets/networks/rpc_config.json';
// import Market from '../Contracts/Marketplace.json';
import {ERC1155, ERC721, MetaPixelsAbi, SouthSideAntsReadAbi} from '../Contracts/Abis';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/browser';
import { dataURItoBlob } from '../Store/utils';
import moment from 'moment';
import { SortOption } from '../Components/Models/sort-option.model';

import { FilterOption } from '../Components/Models/filter-option.model';
import {isMetapixelsCollection, isSouthSideAntsCollection} from "../utils";

const gatewayTools = new IPFSGatewayTools();
const gateway = 'https://mygateway.mypinata.cloud';
const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
// const readMarket = new Contract(config.market_contract, Market.abi, readProvider);
const knownContracts = config.known_contracts;

const api = {
  baseUrl: config.api_base,
  listings: '/listings',
  collections: '/collections',
  marketData: '/marketdata',
  nft: '/nft',
  auctions: '/auctions',
  unfilteredListings: '/unfilteredlistings',
};

export default api;

// export const ebisusApi = createApi({
//     reducerPath: 'ebisusApi',
//     baseQuery: fetchBaseQuery({  baseUrl: 'https://api.ebisusbay.com' }),
//     endpoints: (builder) => ({
//         fetchListings: builder.query
//     })
// });

//  just for sortAndFetchListings function
let abortController = null;

export async function sortAndFetchListings(page, sort, filter, traits, powertraits, search) {
  let pagesize = 12;

  let query = {
    state: 0,
    page: page,
    pageSize: pagesize,
    sortBy: 'listingId',
    direction: 'desc',
  };

  if (filter && filter instanceof FilterOption) {
    query = { ...query, ...filter.toApi() };
  }

  if (sort && sort instanceof SortOption) {
    query = { ...query, ...sort.toApi() };
  }

  if (traits && Object.keys(traits).length > 0) {
    //  traits      = { traitCategoryName1: {traitName2: true }, traitCategoryName3: {traitName4: false}}
    //  traitFilter = { traitCategoryName1: ['traitName2']}
    const traitFilter = Object.keys(traits)
      .map((traitCategoryName) => {
        const traitCategory = traits[traitCategoryName];

        const traitCategoryKeys = Object.keys(traitCategory);

        const truthyFilters = traitCategoryKeys.filter((traitCategoryKey) => traitCategory[traitCategoryKey]);

        return truthyFilters.length === 0 ? {} : { [traitCategoryName]: truthyFilters };
      })
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    query['traits'] = JSON.stringify(traitFilter);
  }

  if (powertraits && Object.keys(powertraits).length > 0) {
    const traitFilter = Object.keys(powertraits)
      .map((traitCategoryName) => {
        const traitCategory = powertraits[traitCategoryName];

        const traitCategoryKeys = Object.keys(traitCategory);

        const truthyFilters = traitCategoryKeys.filter((traitCategoryKey) => traitCategory[traitCategoryKey]);

        return truthyFilters.length === 0 ? {} : { [traitCategoryName]: truthyFilters };
      })
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    query['powertraits'] = JSON.stringify(traitFilter);
  }

  if (search) query['search'] = search;

  const queryString = new URLSearchParams(query);

  const url = new URL(api.listings, `${api.baseUrl}`);
  const uri = `${url}?${queryString}`;

  //  Debugging
  const date = new Date();
  //  Debugging
  const time = `${date.getSeconds()}-${date.getMilliseconds()}`;
  //  Debugging
  const log = (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${time} ${message}`);
    }
  };

  try {
    log(`Ongoing call: ${!!abortController}`);

    if (abortController) {
      abortController.abort();
      log(`Cancelled previous call.`);
    }

    abortController = new AbortController();
    const { signal } = abortController;

    const response = await fetch(uri, { signal });

    abortController = null;
    log(`Went through.`);

    return { cancelled: false, response: await response.json() };
  } catch (error) {
    if (error && error.name === 'AbortError') {
      log(`Cancelled.`);
      return { cancelled: true, response: [] };
    }
    abortController = null;
    throw new TypeError(error);
  }
}

export async function getListing(listingId) {
  try {
    const uri = `${api.baseUrl}${api.listings}?listingId=${listingId}`;
    var rawListing = await (await fetch(uri)).json();

    rawListing = rawListing['listings'][0];

    const isMetaPixels = isMetapixelsCollection(rawListing['nftAddress']);
    if (isMetaPixels) {
      const contract =  new Contract(rawListing['nftAddress'], MetaPixelsAbi, readProvider);
      const data = await contract.lands(rawListing['nftId']);
      const plotSize = `${(data.xmax - data.xmin + 1)}x${(data.ymax - data.ymin + 1)}`;
      const plotCoords = `(${data.xmin}, ${data.ymin})`
      rawListing['nft'].description = `Metaverse Pixel plot at ${plotCoords} with a ${plotSize} size`
    }

    const listing = {
      listingId: rawListing['listingId'],
      nftId: rawListing['nftId'],
      seller: rawListing['seller'],
      nftAddress: rawListing['nftAddress'],
      price: rawListing['price'],
      fee: rawListing['fee'],
      is1155: rawListing['is1155'],
      state: rawListing['state'],
      purchaser: rawListing['purchaser'],
      listingTime: rawListing['listingTime'],
      saleTime: rawListing['saleTime'],
      endingTime: rawListing['endingTime'],
      royalty: rawListing['royalty'],
      nft: rawListing['nft'],
      useIframe: isMetaPixels,
      iframeSource: isMetaPixels ? `https://www.metaversepixels.app/grid?id=${rawListing['nftId']}&zoom=3` : null
    };
    return listing;
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
  }
}

export async function getMarketMetadata() {
  const uri = `${api.baseUrl}${api.marketData}`;

  return await (await fetch(uri)).json();
}

export async function getCollectionMetadata(contractAddress, sort, filter) {
  let query = {
    sortBy: 'totalVolume',
    direction: 'desc',
  };
  if (filter != null) query[filter.type] = filter.value;
  if (sort != null && sort.type != null) {
    const sortProps = {
      sortBy: sort.type,
      direction: sort.direction,
    };
    query = { ...query, ...sortProps };
  }
  if (contractAddress != null) query['collection'] = ethers.utils.getAddress(contractAddress.toLowerCase());

  const queryString = new URLSearchParams(query);

  const uri = `${api.baseUrl}${api.collections}?${queryString}`;
  return await (await fetch(uri)).json();
}

export async function getCollectionTraits(contractAddress) {
  try {
    const internalUri = `https://app.ebisusbay.com/files/${contractAddress.toLowerCase()}/rarity.json`;

    return await (await fetch(internalUri)).json();
  } catch (error) {
    console.log(error);
  }

  return null;
}

export async function getCollectionPowertraits(contractAddress) {
  try {
    const internalUri = `https://app.ebisusbay.com/files/${contractAddress.toLowerCase()}/powertraits.json`;

    return await (await fetch(internalUri)).json();
  } catch (error) {
    console.log(error);
  }

  return null;
}

export async function getNftsForAddress(walletAddress, walletProvider, onNftLoaded) {
  if (!walletAddress || !walletProvider) {
    return;
  }

  const signer = walletProvider.getSigner();

  let listings = [];
  let chunkParams = {complete: false, pageSize: 100, curPage: 1}
  while (!chunkParams.complete) {
    const queryString = new URLSearchParams({
      state: 0,
      page: chunkParams.curPage,
      pageSize: chunkParams.pageSize,
      seller: walletAddress
    });
    const url = new URL(api.listings, `${api.baseUrl}`);
    const listingsReponse = await (await fetch(`${url}?${queryString}`)).json();
    listings = [...listings, ...listingsReponse.listings];
    chunkParams.complete = listingsReponse.listings.length < chunkParams.pageSize;
    chunkParams.curPage++
  }

  //  Helper function
  const getListing = (address, id) => {
    return listings.find((listing) => {
      const sameId = ethers.BigNumber.from(listing['nftId']).eq(id);
      const sameAddress = listing['nftAddress'].toLowerCase() === address.toLowerCase();
      return sameId && sameAddress;
    });
  };

  const getERC1155Listings = (address, id) => {
    return listings.filter((listing) => {
      const sameId = ethers.BigNumber.from(listing['nftId']).eq(id);
      const sameAddress = listing['nftAddress'].toLowerCase() === address.toLowerCase();
      return sameId && sameAddress && listing.state === 0;
    });
  };

  let response = {
    nfts: [],
    isMember: false,
  };

  await Promise.all(
    knownContracts
      .filter((c) => !!c.address)
      .map(async (knownContract) => {
        try {
          const address = knownContract.address;
          const listable = knownContract.listable;
          const isMetaPixels = isMetapixelsCollection(address);
          const isSouthSideAnts = isSouthSideAntsCollection(address);

          if (knownContract.multiToken) {
            let canTransfer = true;
            let canSell = true;
            const listed = !!getListing(address, knownContract.id);
            const listingId = listed ? getListing(address, knownContract.id).listingId : null;
            const price = listed ? getListing(address, knownContract.id).price : null;
            let erc1155Listings = getERC1155Listings(address, knownContract.id);

            const contract = new Contract(knownContract.address, ERC1155, signer);
            contract.connect(signer);
            let count = await contract.balanceOf(walletAddress, knownContract.id);
            count = count.toNumber();
            if (knownContract.address === config.membership_contract && count > 0) {
              response.isMember = true;
            }
            if (count === 0) {
              return;
            }

            let uri = await contract.uri(knownContract.id);

            if (gatewayTools.containsCID(uri)) {
              try {
                uri = gatewayTools.convertToDesiredGateway(uri, gateway);
              } catch (error) {
                //console.log(error);
              }
            }
            const json = await (await fetch(uri)).json();
            const name = json.name;
            const image = gatewayTools.containsCID(json.image)
              ? gatewayTools.convertToDesiredGateway(json.image, gateway)
              : json.image;
            const description = json.description;
            const properties = json.properties;
            const nft = {
              name: name,
              id: knownContract.id,
              image: image,
              count: count,
              description: description,
              properties: properties,
              contract: contract,
              address: knownContract.address,
              multiToken: true,
              listable,
              listed,
              listingId,
              price,
              canSell: canSell,
              canTransfer: canTransfer
            };

            onNftLoaded([nft]);
            /*
            for (const item of erc1155Listings) {
              let nft = {
                name: name,
                id: knownContract.id,
                image: image,
                description: description,
                properties: properties,
                contract: contract,
                address: knownContract.address,
                multiToken: true,
                listable,
                listed: true,
                listingId: item.listingId,
                price: item.price,
                canSell: canSell,
                canTransfer: canTransfer
              };
              onNftLoaded([nft]);
            }
            for (let i = 0; i < count - erc1155Listings.length; i++) {
              if (erc1155Listings.length == 1) {
                canSell = false;
              }
              if (erc1155Listings == 0 && i != 0) {
                canSell = false;
              }
              console.log(canSell);
              let nft = {
                name: name,
                id: knownContract.id,
                image: image,
                description: description,
                properties: properties,
                contract: contract,
                address: knownContract.address,
                multiToken: true,
                listable,
                canSell: canSell,
                canTransfer: canTransfer
              };
              onNftLoaded([nft]);
            } */

          } else {
            const contract = (() => {
              if (isMetaPixels) {
                return new Contract(address, MetaPixelsAbi, signer);
              }
              return new Contract(address, ERC721, signer);
            })();

            const readContract = (() => {
              if (isMetaPixels) {
                return new Contract(address, MetaPixelsAbi, readProvider);
              }
              if (isSouthSideAnts) {
                return new Contract(address, SouthSideAntsReadAbi, readProvider);
              }
              return new Contract(address, ERC721, readProvider);
            })();

            contract.connect(signer);

            const count = await contract.balanceOf(walletAddress);
            let ids = [];
            if (count > 0) {
              try {
                if (isSouthSideAnts) {
                  ids = await readContract.getNftByUser(walletAddress);
                } else {
                  await readContract.tokenOfOwnerByIndex(walletAddress, 0);
                }
              } catch (error) {
                ids = await readContract.walletOfOwner(walletAddress);
              }
            }
            for (let i = 0; i < count; i++) {
              let canTransfer = true;
              let canSell = true;
              let id;
              if (ids.length === 0) {
                try {
                  id = await readContract.tokenOfOwnerByIndex(walletAddress, i);
                } catch (error) {
                  continue;
                }
              } else {
                id = ids[i];
              }

              const listed = !!getListing(address, id);
              const listingId = listed ? getListing(address, id).listingId : null;
              const price = listed ? getListing(address, id).price : null;

              const uri = await (async () => {
                if (knownContract.name === 'Ant Mint Pass') {
                  //  fix for https://ebisusbay.atlassian.net/browse/WEB-166
                  //  ant mint pass contract hard coded to this uri for now - remove this when CSS goes live
                  return 'https://gateway.pinata.cloud/ipfs/QmWLqeupPQsb4MTtJFjxEniQ1F67gpQCzuszwhZHFx6rUM';
                }

                if (knownContract.name === 'Red Skull Potions') {
                  // fix for CroSkull's Red Skull Potions
                  return `https://gateway.pinata.cloud/ipfs/QmQd9sFZv9aTenGD4q4LWDQWnkM4CwBtJSL82KLveJUNTT/${id}`;
                }
                if (isMetaPixels) {
                  return await readContract.lands(id);
                }

                return await readContract.tokenURI(id);
              })();

              if (isMetaPixels) {
                const numberId = id instanceof BigNumber ? id.toNumber() : id;
                const image = `${uri.image}`.startsWith('https://')
                  ? uri.image
                  : `https://ipfs.metaversepixels.app/ipfs/${uri.image}`;
                const description = uri.detail;
                const name = `${knownContract.name} ${id}`;
                const properties = {};
                const nft = {
                  id: numberId,
                  name,
                  image,
                  description,
                  properties,
                  contract,
                  address,
                  multiToken: false,
                  listable: true,
                  transferable: false,
                  listed,
                  listingId,
                  price,
                  canSell: canSell,
                  canTransfer: canTransfer
                };
                onNftLoaded([nft]);
                continue;
              }

              if (knownContract.onChain) {
                const json = Buffer.from(uri.split(',')[1], 'base64');
                const parsed = JSON.parse(json);
                const name = parsed.name;
                const image = dataURItoBlob(parsed.image, 'image/svg+xml');
                const desc = parsed.description;
                const properties = parsed.properties ? parsed.properties : parsed.attributes;
                const nft = {
                  id: id,
                  name: name,
                  image: URL.createObjectURL(image),
                  description: desc,
                  properties: properties,
                  contract: contract,
                  address: knownContract.address,
                  multiToken: false,
                  listable,
                  listed,
                  listingId,
                  price,
                  canSell: canSell,
                  canTransfer: canTransfer
                };
                onNftLoaded([nft]);
              } else {
                const checkedUri = (() => {
                  try {
                    if (gatewayTools.containsCID(uri) && !uri.startsWith('ar')) {
                      return gatewayTools.convertToDesiredGateway(uri, gateway);
                    }

                    if (uri.startsWith('ar')) {
                      return `https://arweave.net/${uri.substring(5)}`;
                    }

                    return uri;
                  } catch (e) {
                    return uri;
                  }
                })();

                let json;
                if (checkedUri.includes('unrevealed')) {
                  json = {
                    id: id,
                    name: knownContract.name + ' ' + id,
                    description: 'Unrevealed!',
                    image: '',
                    contract: contract,
                    address: knownContract.address,
                    multiToken: false,
                    properties: [],
                    listable,
                    listed,
                    listingId,
                    price,
                    canSell: canSell,
                    canTransfer: canTransfer
                  };
                } else {
                  json = await (await fetch(checkedUri)).json();
                }
                let image;
                if (json.image.startsWith('ipfs')) {
                  image = `${gateway}/ipfs/${json.image.substring(7)}`;
                } else if (gatewayTools.containsCID(json.image) && !json.image.startsWith('ar')) {
                  try {
                    image = gatewayTools.convertToDesiredGateway(json.image, gateway);
                  } catch (error) {
                    image = json.image;
                  }
                } else if (json.image.startsWith('ar')) {
                  if (typeof json.tooltip !== 'undefined') {
                    image = `https://arweave.net/${json.tooltip.substring(5)}`;
                  } else {
                    image = `https://arweave.net/${json.image.substring(5)}`;
                  }
                } else {
                  image = json.image;
                }
                let isStaked;
                if (address == "0x0b289dEa4DCb07b8932436C2BA78bA09Fbd34C44") { 
                  if (await contract.stakedApes(id)) {
                    canTransfer = false;
                    canSell = false;
                    isStaked = true;
                  }
                }
                const nft = {
                  id: id,
                  name: json.name,
                  image: image,
                  description: json.description,
                  properties: json.properties ? json.properties : json.attributes,
                  contract: contract,
                  address: knownContract.address,
                  multiToken: false,
                  listable,
                  listed,
                  listingId,
                  price,
                  canTransfer: canTransfer,
                  canSell: canSell,
                  isStaked: isStaked
                };
                onNftLoaded([nft]);
              }
            }
          }
        } catch (error) {
          console.log('error fetching ' + knownContract.name);
          console.log(error);
          Sentry.captureException(error);
        }
      })
  );

  return response;
}

export async function getUnfilteredListingsForAddress(walletAddress, walletProvider, page) {
  let query = {
    seller: walletAddress,
    state: 0,
    pageSize: 25,
    page: page,
    sortBy: 'listingTime',
    direction: 'asc',
  };

  try {
    const signer = walletProvider.getSigner();

    const queryString = new URLSearchParams(query);
    const url = new URL(api.unfilteredListings, `${api.baseUrl}`);
    const response = await fetch(`${url}?${queryString}`);
    let json = await response.json();
    const listings = json.listings || [];

    // to get id and address of nft to check if it's inside user's wallet.
    const walletNftsNotFlattened = await Promise.all(
      knownContracts
        .filter((x) => !!x.address)
        .map(async (knownContract) => {
          try {
            const address = knownContract.address;
            const isMetaPixels =
              (
                (knownContracts.find((knownContract) => knownContract.name === 'MetaPixels') ?? {}).address ?? ''
              ).toLowerCase() === address.toLowerCase();

            const contract = (() => {
              if (knownContract.multiToken) {
                return new Contract(knownContract.address, ERC1155, signer);
              }
              if (isMetaPixels) {
                return new Contract(knownContract.address, MetaPixelsAbi, signer);
              }
              return new Contract(knownContract.address, ERC721, signer);
            })();

            const count = await (async () => {
              const bigNumber = knownContract.multiToken
                ? await contract.balanceOf(walletAddress, knownContract.id)
                : await contract.balanceOf(walletAddress);
              return bigNumber.toNumber();
            })();

            if (knownContract.multiToken && count !== 0) {
              return [
                {
                  id: knownContract.id,
                  address: knownContract.address.toLowerCase(),
                },
              ];
            }

            const readContract = (() => {
              if (isMetaPixels) {
                return new Contract(knownContract.address, MetaPixelsAbi, readProvider);
              }
              return new Contract(knownContract.address, ERC721, readProvider);
            })();

            const ids = await (async () => {
              if (count > 0) {
                try {
                  await readContract.tokenOfOwnerByIndex(walletAddress, 0);
                } catch (error) {
                  return await readContract.walletOfOwner(walletAddress);
                }
              }
              return [];
            })();

            const nfts = [];

            for (let i = 0; i < count; i++) {
              const id = await (async () => {
                if (ids.length === 0) {
                  try {
                    return await readContract.tokenOfOwnerByIndex(walletAddress, i);
                  } catch (error) {
                    return null;
                  }
                } else {
                  return ids[i];
                }
              })();

              if (id === null) {
                continue;
              }

              if (isMetaPixels) {
                const numberId = id instanceof BigNumber ? id.toNumber() : id;
                nfts.push({
                  id: numberId,
                  address: knownContract.address.toLowerCase(),
                });
                continue;
              }

              nfts.push({
                id: id.toNumber(),
                address: knownContract.address.toLowerCase(),
              });
            }

            return nfts;
          } catch (e) {
            console.log('Failed to check user nfts for : ' + knownContract.address);
            console.log(e);
            return [];
          }
        })
    );
    //  array of {id, address} wallet nfts
    const walletNfts = walletNftsNotFlattened.flat();

    const filteredListings = listings
      .map((item) => {
        const { listingId, price, nft, purchaser, valid, state, is1155 } = item;
        const { name, image, rank } = nft || {};

        const listingTime = moment(new Date(item.listingTime * 1000)).format('DD/MM/YYYY, HH:mm');
        const id = item.nftId;
        const address = item.nftAddress.toLowerCase();
        const isInWallet = !!walletNfts.find((walletNft) => walletNft.address === address && walletNft.id === id);
        const listed = true;

        const isMetaPixels =
          (
            (knownContracts.find((knownContract) => knownContract.name === 'MetaPixels') ?? {}).address ?? ''
          ).toLowerCase() === address.toLowerCase();
        const contract = (() => {
          if (is1155) {
            return new Contract(address, ERC1155, signer);
          }
          if (isMetaPixels) {
            return new Contract(address, MetaPixelsAbi, signer);
          }
          return new Contract(address, ERC721, signer);
        })();

        contract.connect(signer);

        return {
          contract,
          address,
          id,
          image,
          name,
          state,
          listingTime,
          listed,
          isInWallet,
          listingId,
          price,
          purchaser,
          rank,
          valid,
          useIframe: isMetaPixels,
          iframeSource: isMetaPixels ? `https://www.metaversepixels.app/grid?id=${id}&zoom=3` : null,
        };
      })
      .sort((x) => (x.valid ? 1 : -1));

    json.listings = filteredListings;

    return json;
  } catch (error) {
    console.log('error fetching sales for: ' + walletAddress);
    console.log(error);

    return [];
  }
}

export async function getNftSalesForAddress(walletAddress, page) {
  let query = {
    seller: walletAddress,
    state: 1,
    pageSize: 25,
    page: page,
    sortBy: 'saleTime',
    direction: 'desc',
  };

  try {
    const queryString = new URLSearchParams(query);
    const url = new URL(api.unfilteredListings, `${api.baseUrl}`);
    return await (await fetch(`${url}?${queryString}`)).json();
  } catch (error) {
    console.log('error fetching sales for: ' + walletAddress);
    console.log(error);
    Sentry.captureException(error);

    return [];
  }
}

export async function getNftSalesHistory(collectionId, nftId) {
  try {
    const queryString = new URLSearchParams({
      collection: collectionId.toLowerCase(),
      tokenId: nftId,
    });

    const url = new URL(api.nft, `${api.baseUrl}`);
    const uri = `${url}?${queryString}`;

    const result = await (await fetch(uri)).json();

    return result.listings ?? [];
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
    return [];
  }
}

export async function getNft(collectionId, nftId, useFallback = true) {
  try {
    const queryString = new URLSearchParams({
      collection: collectionId.toLowerCase(),
      tokenId: nftId,
    });

    const url = new URL(api.nft, `${api.baseUrl}`);
    const uri = `${url}?${queryString}`;

    const result = await (await fetch(uri)).json();

    if (useFallback && !result.nft) {
      result.nft = await getNftFromFile(collectionId, nftId);
    }

    const isMetaPixels = isMetapixelsCollection(collectionId);
    if (isMetaPixels) {
      const contract =  new Contract(collectionId, MetaPixelsAbi, readProvider);
      const data = await contract.lands(nftId);
      const plotSize = `${(data.xmax - data.xmin + 1)}x${(data.ymax - data.ymin + 1)}`;
      const plotCoords = `(${data.xmin}, ${data.ymin})`
      result.nft.description = `Metaverse Pixel plot at ${plotCoords} with a ${plotSize} size`
    }

    return result;
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
    return await getNftFromFile(collectionId, nftId);
  }
}

export async function getNftFromFile(collectionId, nftId) {
  try {
    const isMetaPixels = isMetapixelsCollection(collectionId);

    let nft;
    try {
      const internalUri = `https://app.ebisusbay.com/files/${collectionId.toLowerCase()}/metadata/${nftId}.json`;

      return await (await fetch(internalUri)).json();
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    var canTransfer = true;
    var canSell = true;
    if (collectionId === config.cronie_contract) {
      const contract = new Contract(collectionId, ERC721, readProvider);
      let uri = await contract.tokenURI(nftId);

      const json = Buffer.from(uri.split(',')[1], 'base64');
      const parsed = JSON.parse(json);
      const name = parsed.name;
      const image = dataURItoBlob(parsed.image, 'image/svg+xml');
      const desc = parsed.description;
      const properties = []; //(parsed.properties) ? parsed.properties : parsed.attributes;
      nft = {
        name: name,
        image: URL.createObjectURL(image),
        description: desc,
        properties: properties,
        canTransfer: canTransfer,
        canSell: canSell
      };
    } else if (isMetaPixels) {
      const contract = new Contract(collectionId, MetaPixelsAbi, readProvider);
      const uri = await contract.lands(nftId);

      const numberId = nftId instanceof BigNumber ? nftId.toNumber() : nftId;
      const image = `${uri.image}`.startsWith('https://')
        ? uri.image
        : `https://ipfs.metaversepixels.app/ipfs/${uri.image}`;
      const description = uri.detail;
      const name = `MetaPixels ${numberId}`;
      const properties = {};
      nft = {
        name,
        image,
        description,
        properties,
        useIframe: true,
        iframeSource: `https://www.metaversepixels.app/grid?id=${numberId}&zoom=3`,
        canTransfer: canTransfer,
        canSell: canSell
      };
    } else {
      const isMultiToken = knownContracts.findIndex((x) => x.address === collectionId && x.multiToken) > -1;

      let uri;
      var contract;
      if (isMultiToken) {
        contract = new Contract(collectionId, ERC1155, readProvider);
        uri = await contract.uri(nftId);
      } else {
        contract = new Contract(collectionId, ERC721, readProvider);
        uri = await contract.tokenURI(nftId);
      }

      if (gatewayTools.containsCID(uri)) {
        try {
          uri = gatewayTools.convertToDesiredGateway(uri, gateway);
        } catch (error) {
          // console.log(error);
        }
      }
      let json;

      if (uri.includes('unrevealed')) {
        return null;
      } else {
        json = await (await fetch(uri)).json();
      }
      let image;
      if (gatewayTools.containsCID(json.image)) {
        try {
          image = gatewayTools.convertToDesiredGateway(json.image, gateway);
        } catch (error) {
          image = json.image;
        }
      } else {
        image = json.image;
      }
      let isStaked;
      if (collectionId == "0x0b289dEa4DCb07b8932436C2BA78bA09Fbd34C44") { 
        if (await contract.stakedApes(nftId)) {
          canTransfer = false;
          canSell = false;
          isStaked = true;
        }
      }
      const properties = json.properties && Array.isArray(json.properties) ? json.properties : json.attributes;
      nft = {
        name: json.name,
        image: image,
        description: json.description,
        properties: properties ? properties : [],
        canTransfer: canTransfer,
        canSell: canSell,
        isStaked: isStaked
      };
    }

    return nft;
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
  }
}

export async function getNftRankings(contractAddress, nftIds) {
  const commaIds = [].concat(nftIds).join(',');

  let query = {
    collection: contractAddress,
    tokenId: commaIds
  };

  const queryString = new URLSearchParams(query);
  const url = new URL(api.nft, `${api.baseUrl}`);
  const response = await fetch(`${url}?${queryString}`);
  let json = await response.json();

  if (json.data) {
    return json.data.map(o => {
      return {
        id: o.nft?.nftId ?? 0,
        rank: o.nft?.rank ?? 0
      }
    })
  } else if (json.nft) {
    return [{
      id: json.nft.nftId,
      rank: json.nft.rank
    }];
  } else {
    return [];
  }
}

export async function sortAndFetchAuctions(page) {
  const url = new URL(api.auctions, `${api.baseUrl}`);
  return await (await fetch(url)).json();
}

export async function getAuction(auctionId) {
  try {
    const uri = `${api.baseUrl}${api.auctions}?auctionId=${auctionId}`;
    var rawListing = await (await fetch(uri)).json();

    return rawListing['auctions'][0];
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
  }
}
