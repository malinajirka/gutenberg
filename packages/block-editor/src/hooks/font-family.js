/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { hasBlockSupport } from '@wordpress/blocks';
import { SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { cleanEmptyObject } from './utils';
import useEditorFeature from '../components/use-editor-feature';

export const FONT_FAMILY_SUPPORT_KEY = '__experimentalFontFamily';

function FontFamilyControl( {
	fontFamilies = [],
	value = '',
	onChange,
	...props
} ) {
	const options = [
		{ value: '', label: __( 'Default' ) },
		...fontFamilies.map( ( { value: fontFamily, name } ) => {
			return {
				value: fontFamily,
				label: name || fontFamily,
			};
		} ),
	];
	return (
		<SelectControl
			label={ __( 'Font family' ) }
			options={ options }
			value={ options.find( ( option ) => option.key === value ) }
			onChange={ onChange }
			labelPosition="top"
			{ ...props }
		/>
	);
}

const getFontFamilyFromAttributeValue = ( fontFamilies, value ) => {
	const attributeParsed = /var:preset\|font-family\|(.+)/.exec( value );
	if ( attributeParsed && attributeParsed[ 1 ] ) {
		return find( fontFamilies, ( { slug } ) => {
			return slug === attributeParsed[ 1 ];
		} ).value;
	}
	return value;
};

export function FontFamilyEdit( {
	name,
	setAttributes,
	attributes: { style = {} },
} ) {
	const isDisable = useIsFontFamilyDisabled( { name } );
	const fontFamilies = useEditorFeature( 'typography.fontFamilies' );

	if ( isDisable ) {
		return null;
	}

	const fontFamily = getFontFamilyFromAttributeValue(
		fontFamilies,
		style.typography?.fontFamily
	);

	function onChange( newValue ) {
		const predefinedFontFamily = find(
			fontFamilies,
			( { value } ) => value === newValue
		);
		setAttributes( {
			style: cleanEmptyObject( {
				...style,
				typography: {
					...( style.typography || {} ),
					fontFamily: predefinedFontFamily
						? `var:preset|font-family|${ predefinedFontFamily.slug }`
						: newValue || undefined,
				},
			} ),
		} );
	}

	return (
		<FontFamilyControl
			className="block-editor-hooks-font-family-control"
			fontFamilies={ fontFamilies }
			value={ fontFamily }
			onChange={ onChange }
		/>
	);
}

/**
 * Custom hook that checks if font-family functionality is disabled.
 *
 * @param {string} name The name of the block.
 * @return {boolean} Whether setting is disabled.
 */
export function useIsFontFamilyDisabled( { name } ) {
	return (
		! useEditorFeature( 'typography.fontFamilies' ).length ||
		! hasBlockSupport( name, FONT_FAMILY_SUPPORT_KEY )
	);
}
