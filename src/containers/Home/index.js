import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import { initMagento, getCategoryTree } from '../../actions';
import { HOME, CATEGORY_TREE } from '../../reducers/types';
import { BRAND_NAME } from '../../constants';
import { Spinner, MaterialHeaderButtons, Item } from '../../components/common';
import {
  NAVIGATION_CATEGORY_TREE_PATH,
  NAVIGATION_SEARCH_SCREEN_PATH,
  NAVIGATION_WISHLIST_SCREEN_PATH,
  NAVIGATION_CART_SCREEN_PATH,
} from '../../routes/types';

class Home extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: BRAND_NAME,
    headerLeft: (
      <MaterialHeaderButtons>
        <Item title="menu" iconName="menu" onPress={navigation.getParam('toggleDrawer')} />
      </MaterialHeaderButtons>
    ),
    headerRight: (
      <MaterialHeaderButtons>
        <Item title="Search" iconName="search" onPress={() => navigation.navigate(NAVIGATION_SEARCH_SCREEN_PATH)} />
        <Item title="Wishlist" iconName="bookmark" onPress={() => navigation.navigate(NAVIGATION_WISHLIST_SCREEN_PATH)} />
        <Item title="cart" iconName="shopping-cart" onPress={() => navigation.navigate(NAVIGATION_CART_SCREEN_PATH)} />
      </MaterialHeaderButtons>
    ),
  })

  constructor(props) {
    super(props);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  componentDidMount() {
    const { navigation, initMagento: _initMagento } = this.props;
    _initMagento();
    navigation.setParams({ toggleDrawer: this.toggleDrawer });
  }

  toggleDrawer() {
    const {
      navigation,
      categoryTree,
      getCategoryTree: _getCategoryTree,
    } = this.props;
    if (!categoryTree) {
      _getCategoryTree();
    }
    navigation.toggleDrawer();
  }

  renderHomeContent() {
    const { loading, error, content } = this.props;

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (loading) {
      return <Spinner />;
    }

    if (content) {
      return (
        <Text>{JSON.stringify(content)}</Text>
      );
    }

    return null;
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {this.renderHomeContent()}
      </View>
    );
  }
}

const styles = {
  mainContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 8,
  },
  errorText: {
    textAlign: 'center',
  },
};

const mapStateToProps = (state) => {
  const { loading, error, content } = state[HOME];
  const categoryTree = state[CATEGORY_TREE];

  return {
    loading,
    error,
    content,
    categoryTree,
  };
};

export default connect(mapStateToProps, {
  initMagento,
  getCategoryTree
})(Home);