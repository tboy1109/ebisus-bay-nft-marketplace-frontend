import React, { Component } from 'react';
import { faChevronUp, faCircle } from '@fortawesome/free-solid-svg-icons';
import LayeredIcon from '../components/LayeredIcon';

export default class ScrollToTop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_visible: false,
    };
  }

  componentDidMount() {
    var scrollComponent = this;
    document.addEventListener('scroll', function (e) {
      scrollComponent.toggleVisibility();
    });
  }

  toggleVisibility() {
    if (window.pageYOffset > 600) {
      this.setState({
        is_visible: true,
      });
    } else {
      this.setState({
        is_visible: false,
      });
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  render() {
    const { is_visible } = this.state;
    return (
      <div id="eb-scroll-to-top" className="init">
        {is_visible && (
          <div onClick={() => this.scrollToTop()}>
            <LayeredIcon icon={faChevronUp} bgIcon={faCircle} shrink={8} />
          </div>
        )}
      </div>
    );
  }
}
