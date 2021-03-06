export const QuantitySelector = ({ quantity, setQuantity, maxQuantity, name }) => {

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
      <select key={quantity} defaultValue={quantity} onChange={updateQuantity}>
         {buildOptions()}
        </select>
      </div>
    </>
  )

};