import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

const LayeredIcon = ({
  icon,
  bgIcon = faCircle,
  bgClass = 'layer-1',
  bgColor = '#218cff',
  color = '#fff',
  inverse = true,
  stackClass = 'k',
  shrink = 7,
  title,
}) => {
  return (
    <span className={`fa-layers fa-fw fa-2x eb-icon_stack ${stackClass}`} title={title}>
      <FontAwesomeIcon icon={bgIcon} className={bgClass} color={bgColor} />
      <FontAwesomeIcon icon={icon} transform={`shrink-${shrink}`} color={color} inverse={inverse} />
    </span>
  );
};

export default memo(LayeredIcon);
