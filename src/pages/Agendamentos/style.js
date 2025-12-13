import styled from 'styled-components';

const Title = styled.h3`
  font-size: 2rem;
  text-align: center;
  color: #020054;
  margin-top: 2rem;
`;

const TitleModal = styled.h4`
  font-size: 1rem;
  text-align: center;
  color: #020054;
  font-weight: bold;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const Button = styled.button`
  background: #020054;
  border-radius: 3px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15);
  border: none;
  padding: 0.5rem;
  color: #FFFFFF;
  margin-top: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #010038;
  }
`;

const Lista = styled.div`
  background: #FFFFFF;
  border-radius: 3px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15);
  color: #020054;
  font-weight: bold;
  padding: 0.5rem;
  border: none;
  width: 85%;
  max-height: 35rem;
  overflow-y: auto;
  margin-top: 1.5rem;
`;

const AgendamentoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  font-weight: lighter;
  gap: 1rem;
`;

const AgendamentoInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.25rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: bold;
  color: #fff;
  background: ${props => {
    if (props.$status === 'realizada') return '#28a745';
    if (props.$status === 'cancelada') return '#dc3545';
    return '#ffc107';
  }};
`;

const IconGroup = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  svg {
    cursor: pointer;
    color: #333;
    font-size: 1.1rem;
    transition: color .15s;
  }
  svg:hover { color: #020054; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 6px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  background: white;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  min-height: 80px;
  resize: vertical;
`;

const FieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const LabelText = styled.span`
  margin-bottom: 6px;
  align-self: flex-start;
  font-size: 0.95rem;
  color: #020054;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`;

const Primary = styled.button`
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background .12s;
  &:hover { background: #218838; }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Secondary = styled.button`
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background .12s;
  &:hover { background: #c0392b; }
`;

const ErrorMessage = styled.div`
  color: #c0392b;
  text-align: center;
  padding: 0.5rem;
  background: #ffe6e6;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const InfoMessage = styled.div`
  color: #0056b3;
  text-align: center;
  padding: 0.5rem;
  background: #e7f3ff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

export {
  Title,
  TitleModal,
  Button,
  Lista,
  AgendamentoItem,
  AgendamentoInfo,
  StatusBadge,
  IconGroup,
  Overlay,
  ModalBox,
  Header,
  CloseBtn,
  Form,
  Input,
  Select,
  TextArea,
  FieldLabel,
  LabelText,
  Actions,
  Primary,
  Secondary,
  ErrorMessage,
  InfoMessage
};
