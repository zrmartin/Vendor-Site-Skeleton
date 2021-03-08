import NextLink from "next/link"
import { Text, Link } from "@chakra-ui/react"
export const MenuItem = ({ children, to = "/", ...rest }) => {
  return (
    <NextLink href={to} passHref>
      <Link>{children}</Link>
    </NextLink>
  )
}