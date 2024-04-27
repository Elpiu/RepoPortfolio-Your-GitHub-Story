import React from "react";


//1) Change here the script
//2) add defer at the end defer ></script>
export const BuyMeCoffeeWidget = () => {

  return <>
    <div className="bmc-widget-container">
      <script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
              data-id="elpiuudeveloper" data-description="Support me on Buy me a coffee!" data-message=""
              data-color="#5F7FFF" data-position="left" data-x_margin="18" data-y_margin="18" defer ></script>
    </div>
  </>
}