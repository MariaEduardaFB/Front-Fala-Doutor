import styled from 'styled-components';

const Title = styled.h3`
  font-size: 2rem;
  text-align: center;
  color: #020054;
  margin-top: 2rem;
`;

const Lista = styled.div`
  background: #FFFFFF;
  border-radius: 3px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15);
  color: #020054;
  font-weight: bold;
  padding: 0.5rem ;
  border: none;
  width: 70%;
  height: 35rem;
  margin-top: 1.5rem;`;


const PacienteItem = styled.div`
  border-bottom: 1px solid #ccc;
  padding: 10px ;
  font-weight: lighter;
`;

export { Title, Lista, PacienteItem };