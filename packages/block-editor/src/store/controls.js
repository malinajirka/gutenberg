/**
 * WordPress dependencies
 */
import { controls as dataControls } from '@wordpress/data-controls';

const controls = {
	SYNC_SELECT: dataControls.SYNC_SELECT,
	SLEEP( { duration } ) {
		return new Promise( ( resolve ) => {
			setTimeout( resolve, duration );
		} );
	},
};

export default controls;
