import { useState } from 'react'
import { NavBarContainer } from './navBarContainer'
import { MenuToggle } from './menuToggle'
import { MenuLinks } from './menuLinks'
import { Logo } from './logo'

export const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false)
 
  const toggle = () => setIsOpen(!isOpen)
 
  return (
    <NavBarContainer {...props}>
      <Logo
        w="100px"
        color={["black", "black", "black", "black"]}
      />
      <MenuToggle toggle={toggle} isOpen={isOpen} />
      <MenuLinks isOpen={isOpen} />
    </NavBarContainer>
  )
}