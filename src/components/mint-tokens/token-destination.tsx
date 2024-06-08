import React, { useEffect, useState } from "react";
import { Button, Heading } from "@stellar/design-system";
import { Pool, poolOptions } from "../../constants/poolOptions";

interface TokenDestProps {
  onClick: (vault: Pool) => void;
}

export const TokenDest = (props: TokenDestProps) => {
  const [options, setOptions] = useState<Pool[]>([]);

  useEffect(() => {
    setOptions(poolOptions);
  }, []);

  const handleOptionClick = (option: Pool) => {
    props.onClick(option);
  };

  return (
    <>
      <Heading as="h1" size="sm">
        Choose your bond
      </Heading>
      <div className="options-container">
        {Array.isArray(options) && options.map((option) => (
          <Button
            key={option.address}
            size="md"
            variant="secondary"
            isFullWidth
            onClick={() => handleOptionClick(option)}
            style={{ textAlign: 'left' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <big style={{ textAlign: 'center', width: '100%', marginBottom: '10px' }}>{option.name}</big>
              <span style={{ textAlign: 'left', width: '100%' }}>
                APY: {option.apy}<br />
                Expires: {option.expiration}<br />
                Underlying: {option.underlying}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </>
  );
};
