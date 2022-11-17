import React, { useEffect, useState } from 'react';
import { ethers, constants } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Countdown from 'react-countdown';
import { getAnalytics, logEvent } from '@firebase/analytics';
import { keyframes } from '@emotion/react';
import Reveal from 'react-awesome-reveal';
import { useParams } from 'react-router-dom';
import { Form, ProgressBar, Spinner } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import * as Sentry from '@sentry/react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import Footer from '../components/Footer';
import config from '../../Assets/networks/rpc_config.json';
import { connectAccount } from '../../GlobalState/User';
import {fetchMemberInfo, fetchVipInfo} from '../../GlobalState/Memberships';
import { fetchCronieInfo } from '../../GlobalState/Cronies';
import {
  caseInsensitiveCompare,
  createSuccessfulTransactionToastContent,
  isCreaturesDrop,
  isCrognomesDrop,
  isFounderDrop, isFounderVipDrop,
  isMagBrewVikingsDrop,
  newlineText,
  percentage,
} from '../../utils';
import { dropState as statuses } from '../../core/api/enums';
import { EbisuDropAbi } from '../../Contracts/Abis';
import MultiDrop from "./multiDrop";
import SingleDrop from "./singleDrop";

export const drops = config.drops;

const Drop = () => {
  const { slug } = useParams();

  const [isMultiDrop, setIsMultiDrop] = useState(false);
  const [drop, setDrop] = useState(null);

  useEffect(() => {
    let drop = drops.find((c) => c.slug === slug);
    if (drop) {
      setDrop(drop);
      setIsMultiDrop(drop.multiMint);
    }
  }, [slug]);

  return (
      <>
        {drop && (
            <>
              {isMultiDrop ? (
                  <MultiDrop drop={drop} />
              ) : (
                  <SingleDrop drop={drop} />
              )}
            </>
        )}
      </>
  );
};
export default Drop;