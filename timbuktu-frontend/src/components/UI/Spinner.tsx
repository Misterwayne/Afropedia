// components/UI/Spinner.tsx
import { Spinner as ChakraSpinner, SpinnerProps } from '@chakra-ui/react';

const Spinner: React.FC<SpinnerProps> = (props) => {
  return (
    <ChakraSpinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="teal.500"
      size="xl"
      {...props} // Pass any additional props
    />
  );
};

export default Spinner;