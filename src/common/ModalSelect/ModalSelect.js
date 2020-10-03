import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ViewPropTypes } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import PropTypes from 'prop-types';
import Text from '../Text/Text';
import Icon from '../Icon/Icon';
import Spinner from '../Spinner/Spinner';
import TextInput from '../TextInput/TextInput';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';

const propTypes = {
  /**
   * Possible option to choose from,
   * NOTE: don't add heading or dummy item in begining
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  /**
   * If selectedkey is provided, it will be used to show
   * selected value in ModalSelect
   */
  selectedKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, null]),
  /**
   * Initial placeholder string shown,
   * when no option is selected
   */
  label: PropTypes.string.isRequired,
  /**
   * Text to append along with the label,
   * when item is selected
   */
  attribute: PropTypes.string,
  /**
   * Function to get called when item is selected
   */
  onChange: PropTypes.func,
  /**
   * Disable the picker
   */
  disabled: PropTypes.bool,
  /**
   * Show loader
   */
  loading: PropTypes.bool,
  /**
   * Container style
   */
  style: ViewPropTypes.style,
  /**
   * Text style
   */
  textStyle: Text.propTypes.style,
  /**
   * Color for placeholder Text and drop down icon
   */
  placeholderTextColor: PropTypes.string,
};

const defaultProps = {
  disabled: false,
  loading: false,
  onChange: () => {},
  selectedKey: null,
  attribute: '',
  style: {},
  textStyle: {},
  placeholderTextColor: '',
};

const ModalSelect = ({
  data,
  disabled,
  loading,
  label,
  selectedKey,
  attribute,
  onChange,
  style,
  textStyle,
  placeholderTextColor,
}) => {
  const [value, setValue] = useState('');
  const { theme } = useContext(ThemeContext);
  const dataWithLabel = [
    {
      key: '5d80812e', // Random key
      section: true,
      label,
    },
    ...data,
  ];

  useEffect(() => {
    if (selectedKey) {
      const option = dataWithLabel.find(_item => _item.key === selectedKey);
      if (!option) return; // TODO: Show default first value
      if (attribute) {
        setValue(`${attribute}: ${option.label}`);
      } else {
        setValue(`${option.label}`);
      }
    }
  }, [selectedKey]);

  const _onChange = option => {
    if (!selectedKey) {
      // Manually set the selected value in drop down
      if (attribute) {
        setValue(`${attribute}: ${option.label}`);
      } else {
        setValue(`${option.label}`);
      }
    }
    if (onChange) {
      onChange(option.key, option);
    }
  };

  return (
    <ModalSelector
      accessible
      disabled={loading || disabled}
      data={dataWithLabel}
      onChange={_onChange}
      selectedKey={selectedKey}
      keyExtractor={item => item.id}
      scrollViewAccessibilityLabel={translate('modalSelect.scroll')}
      cancelButtonAccessibilityLabel={translate('modalSelect.cancelButton')}
    >
      <TextInput
        containerStyle={StyleSheet.flatten([
          style,
          disabled && styles.disabledContainer,
        ])}
        inputStyle={StyleSheet.flatten([styles.inputStyle, textStyle])}
        editable={false}
        placeholder={label}
        value={value}
        placeholderTextColor={placeholderTextColor}
        rightIcon={
          loading ? (
            <Spinner size="small" />
          ) : (
            <Icon
              name="arrow-drop-down"
              size={30}
              color={placeholderTextColor || theme.labelTextColor}
            />
          )
        }
      />
    </ModalSelector>
  );
};

// TODO: add style for disabled element
const styles = {
  inputStyle: {
    textAlign: 'center',
  },
  disabledContainer: {
    opacity: 0.5,
  },
};

ModalSelect.propTypes = propTypes;

ModalSelect.defaultProps = defaultProps;

export default ModalSelect;
