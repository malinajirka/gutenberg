/**
 * External dependencies
 */
import { upperFirst } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, createRef } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import {
	InnerBlocks,
	InspectorControls,
	BlockControls,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { useDispatch, withSelect, withDispatch } from '@wordpress/data';
import { PanelBody, ToggleControl, ToolbarGroup } from '@wordpress/components';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useBlockNavigator from './use-block-navigator';
import * as navIcons from './icons';
import NavigationPlaceholder from './placeholder';

const ref = createRef();

function Navigation( {
	selectedBlockHasDescendants,
	attributes,
	clientId,
	hasExistingNavItems,
	isImmediateParentOfSelectedBlock,
	isSelected,
	updateInnerBlocks,
	className,
} ) {
	const [ isPlaceholderShown, setIsPlaceholderShown ] = useState(
		! hasExistingNavItems
	);

	const { selectBlock } = useDispatch( 'core/block-editor' );

	if ( isPlaceholderShown ) {
		return (
			<Block.div>
				<NavigationPlaceholder
					ref={ ref }
					onCreate={ ( blocks, selectNavigationBlock ) => {
						setIsPlaceholderShown( false );
						updateInnerBlocks( blocks );
						if ( selectNavigationBlock ) {
							selectBlock( clientId );
						}
					} }
				/>
			</Block.div>
		);
	}

	const blockClassNames = classnames( className, {
		[ `items-justified-${ attributes.itemsJustification }` ]: attributes.itemsJustification,
		'is-vertical': attributes.orientation === 'vertical',
	} );

	return (
		<>
			<Block.nav className={ blockClassNames }>
				<InnerBlocks
					ref={ ref }
					allowedBlocks={ [
						'core/navigation-link',
						'core/search',
						'core/social-links',
					] }
					renderAppender={
						( isImmediateParentOfSelectedBlock &&
							! selectedBlockHasDescendants ) ||
						isSelected
							? InnerBlocks.DefaultAppender
							: false
					}
					templateInsertUpdatesSelection={ false }
					orientation={ attributes.orientation || 'horizontal' }
					__experimentalTagName="ul"
					__experimentalAppenderTagName="li"
					__experimentalPassedProps={ {
						className: 'wp-block-navigation__container',
					} }
					__experimentalCaptureToolbars={ true }
					// Template lock set to false here so that the Nav
					// Block on the experimental menus screen does not
					// inherit templateLock={ 'all' }.
					templateLock={ false }
				/>
			</Block.nav>
		</>
	);
}

export const withInspectorControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( props.name !== 'core/navigation' ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Display settings' ) }>
						<ToggleControl
							checked={ props.attributes.showSubmenuIcon }
							onChange={ ( value ) => {
								props.setAttributes( {
									showSubmenuIcon: value,
								} );
							} }
							label={ __( 'Show submenu indicator icons' ) }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withInspectorControls'
);

addFilter(
	'editor.BlockEdit',
	'core/block-library/navigation/with-inspector-controls',
	withInspectorControls
);

export const withBlockControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( props.name !== 'core/navigation' ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;

		function handleItemsAlignment( align ) {
			return () => {
				const itemsJustification =
					attributes.itemsJustification === align ? undefined : align;
				setAttributes( {
					itemsJustification,
				} );
			};
		}
		return (
			<>
				<BlockEdit { ...props } />
				<BlockControls>
					<ToolbarGroup
						icon={
							attributes.itemsJustification
								? navIcons[
										`justify${ upperFirst(
											attributes.itemsJustification
										) }Icon`
								  ]
								: navIcons.justifyLeftIcon
						}
						label={ __( 'Change items justification' ) }
						isCollapsed
						controls={ [
							{
								icon: navIcons.justifyLeftIcon,
								title: __( 'Justify items left' ),
								isActive:
									'left' === attributes.itemsJustification,
								onClick: handleItemsAlignment( 'left' ),
							},
							{
								icon: navIcons.justifyCenterIcon,
								title: __( 'Justify items center' ),
								isActive:
									'center' === attributes.itemsJustification,
								onClick: handleItemsAlignment( 'center' ),
							},
							{
								icon: navIcons.justifyRightIcon,
								title: __( 'Justify items right' ),
								isActive:
									'right' === attributes.itemsJustification,
								onClick: handleItemsAlignment( 'right' ),
							},
						] }
					/>
				</BlockControls>
			</>
		);
	},
	'withBlockControls'
);

addFilter(
	'editor.BlockEdit',
	'core/block-library/navigation/with-block-controls',
	withBlockControls
);

export const withListView = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( props.name !== 'core/navigation' ) {
			return <BlockEdit { ...props } />;
		}

		const { clientId } = props;
		const { navigatorToolbarButton, navigatorModal } = useBlockNavigator(
			clientId
		);

		return (
			<>
				<BlockEdit { ...props } />
				<BlockControls>
					<ToolbarGroup>{ navigatorToolbarButton }</ToolbarGroup>
				</BlockControls>
				{ navigatorModal }
			</>
		);
	},
	'withListView'
);

addFilter(
	'editor.BlockEdit',
	'core/block-library/navigation/with-list-view',
	withListView
);

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const innerBlocks = select( 'core/block-editor' ).getBlocks( clientId );
		const {
			getClientIdsOfDescendants,
			hasSelectedInnerBlock,
			getSelectedBlockClientId,
		} = select( 'core/block-editor' );
		const isImmediateParentOfSelectedBlock = hasSelectedInnerBlock(
			clientId,
			false
		);
		const selectedBlockId = getSelectedBlockClientId();
		const selectedBlockHasDescendants = !! getClientIdsOfDescendants( [
			selectedBlockId,
		] )?.length;
		return {
			isImmediateParentOfSelectedBlock,
			selectedBlockHasDescendants,
			hasExistingNavItems: !! innerBlocks.length,
		};
	} ),
	withDispatch( ( dispatch, { clientId } ) => {
		return {
			updateInnerBlocks( blocks ) {
				if ( blocks?.length === 0 ) {
					return false;
				}
				dispatch( 'core/block-editor' ).replaceInnerBlocks(
					clientId,
					blocks
				);
			},
		};
	} ),
] )( Navigation );
