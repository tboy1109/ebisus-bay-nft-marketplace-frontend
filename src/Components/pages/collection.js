import React, { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import config from '../../Assets/networks/rpc_config.json';
import Collection1155 from './collection1155';
import Collection721 from './collection721';
import { caseInsensitiveCompare, collections } from '../../utils';

const knownContracts = config.known_contracts;

const Collection = () => {
  const { slug } = useParams();

  const [type, setType] = useState('721');
  const [collection, setCollection] = useState(null);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    setRedirect(false);
    let col = knownContracts.find((c) => c.slug === slug);
    if (col) {
      setCollection(col);
      setType(col.multiToken ? '1155' : '721');
      if (col.multiToken) setType(col.multiToken ? '1155' : '721');
    } else {
      col = knownContracts.find((c) => caseInsensitiveCompare(c.address, slug));
      if (col) {
        setCollection(col);
        setRedirect(true);
      }
    }
  }, [slug]);

  return (
    <>
      {collection && (
        <>
          {redirect ? (
            <Redirect to={`/collection/${collection.slug}`} />
          ) : (
            <>
              {type === '1155' ? (
                <>
                {collection.split ? (
                  <Collection1155 address={collection.address} tokenId={collection.id} />
                ) : (
                  <Collection1155 address={collection.address} />
                )}
                </>
              ) : (
                <Collection721 address={collection.address} />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default Collection;
