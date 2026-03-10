import { Button, type ButtonProps } from '@mui/material';
import './CommonButton.css';

type CommonButtonProps = ButtonProps

function CommonButton({ children, sx, className, ...props }: CommonButtonProps) {
  return (
    <Button
      {...props}
      className={`common-button ${className}`}
      sx={{
        textTransform: 'none',
        ...sx,
      }}
    >
      {children}
    </Button>
  )
}

export default CommonButton
