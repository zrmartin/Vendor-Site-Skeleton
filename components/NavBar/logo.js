import NextLink from "next/link"
import { Box, Link } from "@chakra-ui/react"
const { URL_PATHS: { Home_Page }} = require('../../util/constants/urlPaths')

export const Logo = (props) => {
  return (
    <Box {...props}>
      <Link as={NextLink} href={Home_Page}>Logo</Link>
    </Box>
  )
};