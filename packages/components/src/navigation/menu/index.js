/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { ROOT_MENU } from '../constants';
import { NavigationMenuContext } from './context';
import { useNavigationContext } from '../context';
import { useNavigationTreeMenu } from './use-navigation-tree-menu';
import NavigationMenuTitle from './menu-title';
import { MenuBackButtonUI, MenuUI } from '../styles/navigation-styles';

export default function NavigationMenu( props ) {
	const {
		backButtonLabel,
		children,
		className,
		hasSearch,
		menu = ROOT_MENU,
		parentMenu,
		title,
	} = props;
	const [ search, setSearch ] = useState( '' );
	useNavigationTreeMenu( props );
	const {
		activeMenu,
		setActiveMenu,
		navigationTree,
	} = useNavigationContext();

	const isActive = activeMenu === menu;

	const context = {
		isActive,
		menu,
		search,
	};

	// Keep the children rendered to make sure inactive items are included in the navigation tree
	if ( ! isActive ) {
		return (
			<NavigationMenuContext.Provider value={ context }>
				{ children }
			</NavigationMenuContext.Provider>
		);
	}

	const parentMenuTitle = navigationTree.getMenu( parentMenu )?.title;
	const classes = classnames( 'components-navigation__menu', className );

	return (
		<NavigationMenuContext.Provider value={ context }>
			<MenuUI className={ classes }>
				{ parentMenu && (
					<MenuBackButtonUI
						className="components-navigation__back-button"
						isTertiary
						onClick={ () => setActiveMenu( parentMenu, 'right' ) }
					>
						<Icon icon={ chevronLeft } />
						{ backButtonLabel || parentMenuTitle || __( 'Back' ) }
					</MenuBackButtonUI>
				) }

				<NavigationMenuTitle
					hasSearch={ hasSearch }
					search={ search }
					setSearch={ setSearch }
					title={ title }
				/>

				<ul>{ children }</ul>
			</MenuUI>
		</NavigationMenuContext.Provider>
	);
}
