/**
 * WordPress dependencies
 */
import {
	registerBlockType,
	unstable__bootstrapServerSideBlockDefinitions, // eslint-disable-line camelcase
} from '@wordpress/blocks';
import '@wordpress/notices';
import { render } from '@wordpress/element';
import {
	registerCoreBlocks,
	__experimentalRegisterExperimentalCoreBlocks,
} from '@wordpress/block-library';

/**
 * Internal dependencies
 */
import './store';
import './hooks';
import * as legacyWidget from './blocks/legacy-widget';
import EditWidgetsInitializer from './components/edit-widgets-initializer';
import CustomizerEditWidgetsInitializer from './components/customizer-edit-widgets-initializer';

/**
 * Initializes the block editor in the widgets screen.
 *
 * @param {string} id       ID of the root element to render the screen in.
 * @param {Object} settings Block editor settings.
 */
export function initialize( id, settings ) {
	registerCoreBlocks();
	registerBlock( legacyWidget );
	if ( process.env.GUTENBERG_PHASE === 2 ) {
		__experimentalRegisterExperimentalCoreBlocks( settings );
	}
	render(
		<EditWidgetsInitializer settings={ settings } />,
		document.getElementById( id )
	);
}

/**
 * Initializes the block editor in the widgets Customizer section.
 *
 * @param {string} id       ID of the root element to render the section in.
 * @param {Object} settings Block editor settings.
 */
export function customizerInitialize( id, settings ) {
	registerCoreBlocks();
	registerBlock( legacyWidget );
	if ( process.env.GUTENBERG_PHASE === 2 ) {
		__experimentalRegisterExperimentalCoreBlocks( settings );
	}
	render(
		<CustomizerEditWidgetsInitializer settings={ settings } />,
		document.getElementById( id )
	);
}

/**
 * Function to register an individual block.
 *
 * @param {Object} block The block to be registered.
 *
 */
const registerBlock = ( block ) => {
	if ( ! block ) {
		return;
	}
	const { metadata, settings, name } = block;
	if ( metadata ) {
		unstable__bootstrapServerSideBlockDefinitions( { [ name ]: metadata } );
	}
	registerBlockType( name, settings );
};
