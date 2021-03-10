import { Box, Stack } from "@chakra-ui/react";
import { MenuItem } from './menuItem'
import { useAccount } from '../../context/accountContext';
const { URL_PATHS: { Owner_Shop_Index_Page, Owner_Products_Index_Page, Shopping_Cart_Index_Page, Owner_Index_Page, All_Shops_Index_Page, Products_Index_Page }} = require('../../util/constants/urlPaths')
const { ROLES: { owner }} = require('../../util/constants/roles')

export const MenuLinks = ({ isOpen }) => {
  const { account, shopId } = useAccount();
  const accountRoles = account?.data?.roles
  return (
    <Box
      display={{ base: isOpen ? "block" : "none", md: "block" }}
      flexBasis={{ base: "100%", md: "auto" }}
    >
      <Stack
        spacing={8}
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        {
          accountRoles && accountRoles.includes(owner) ? (
            shopId ? (
              <>
                <MenuItem to={Owner_Shop_Index_Page}>Your Shop </MenuItem>
                <MenuItem to={Owner_Products_Index_Page}>Your Products </MenuItem>
              </>
            ) : (
              <>
                <MenuItem to={Owner_Index_Page}>Owner Home </MenuItem>
              </>
            )
          ) : (
            <>
            </>
          )
        }
        <MenuItem to={All_Shops_Index_Page}>Shops </MenuItem>
        <MenuItem to={Products_Index_Page}>All Products </MenuItem>
      </Stack>
    </Box>
  );
};