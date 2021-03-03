import { useEffect } from 'react'

export const QuantitySelector = ({ quantity, setQuantity, maxQuantity }) => {
  useEffect(() => {
    setQuantity(quantity)
  }, [quantity])

  const updateQuantity = (e) => {
    setQuantity(parseInt(e.target.value))
  }

  const buildOptions = () => {
    var arr = [];
    for (let i = 1; i <= maxQuantity; i++) {
        arr.push(<option data-testid="select-option" key={i} value={i}>{i}</option>)
    }
    return arr; 
  }

  return (
    <>
      <div>
        <p>
          Quantity
        </p>
      </div>
      <div>
        <select value={quantity} onChange={updateQuantity}>
         {buildOptions()}
        </select>
      </div>
    </>
  )

};