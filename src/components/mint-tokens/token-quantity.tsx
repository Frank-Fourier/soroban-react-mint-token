import React, { ChangeEvent } from "react";
import { Button, Heading, Input } from "@stellar/design-system";

interface TokenQuantityProps {
  quantity: string;
  onClick: () => void;
  setQuantity: (quantity: string) => void;
  tokenSymbol: string;
  tokenBalance: string;
  TVL: string;
}

export const TokenQuantity = (props: TokenQuantityProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setQuantity(event.target.value);
  };

  const handleMaxClick = () => {
    props.setQuantity(props.tokenBalance);
  };

  return (
    <>
      <div className="header">
        <Heading as="h1" size="sm" addlClassName="title">
          Set Quantity To Invest
        </Heading>
        <div className="tvl" style={{ position: 'absolute', top: '10px', right: '10px' }}>
          TVL: {parseFloat(props.TVL).toFixed(2).toString()} {props.tokenSymbol}
        </div>
      </div>
      <Heading size="sm" as="h2" addlClassName="quantity" style={{ marginTop: "20px"}}>
        {parseFloat(props.quantity) === 0 ? "0" : props.quantity} {props.tokenSymbol}
      </Heading>
      <Input
        fieldSize="md"
        id="input-amount"
        label=<span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Balance: {parseFloat(props.tokenBalance).toFixed(2).toString()} {props.tokenSymbol}<Button size="xs" onClick={handleMaxClick} style={{ marginLeft: '10px' }} variant="secondary">
          Max
        </Button></span>
        value={props.quantity}
        onChange={handleChange}
        type="number"
      />
      <div className="submit-row">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={props.onClick}
          disabled={props.quantity.length < 1}
        >
          Next
        </Button>
      </div>
    </>
  );
};
