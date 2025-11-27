import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-image: url('/image-doctor.jpg'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
`;


const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.48));
  pointer-events: none;
  
`;

const Title = styled.h1`
  font-size: 3.4rem;
  line-height: 1;
  text-align: left;
  color: #fff;
  z-index: 2;
  margin: 0 0 0.6rem 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  font-weight: 800;
  text-shadow: 0 6px 28px rgba(0,0,0,0.55);
`;

const Button = styled.button`
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,245,255,0.95));
  border-radius: 999px;
  color: #020054;
  font-weight: 700;
  padding: 0.9rem 2.2rem;
  border: none;
  min-width: 12rem;
  margin-top: 1rem;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 10px 30px rgba(2,0,84,0.18);
  transition: transform .18s ease, box-shadow .18s ease, opacity .12s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  &:hover { transform: translateY(-4px); box-shadow: 0 18px 44px rgba(2,0,84,0.24); }
  align-self: flex-end;
  margin-right: -1rem;
`;

const SecondaryButton = styled(Button)`
  /* Keep same visual style as primary to match request */
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,245,255,0.95));
  color: #020054;
  box-shadow: 0 8px 24px rgba(2,0,84,0.14);
  &:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(2,0,84,0.20); }
`;

const ButtonGroup = styled.div`
  display:flex;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap:wrap;
  justify-content: flex-end;
  margin-right: -1.5rem;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  width: 100%;
  max-width: 800px;
  padding: 3rem 3.5rem 3rem 2rem;
  border-radius: 0px 16px 16px 0px;
  text-align:right;
  margin-right: 0;
  background: rgba(6,10,24,0.18);
  border-left: 1px solid rgba(255,255,255,0.04);
  backdrop-filter: blur(6px) saturate(120%);
  -webkit-backdrop-filter: blur(6px) saturate(120%);
`;

const Subtitle = styled.p`
  margin: 0;
  color: rgba(255,255,255,0.88);
  font-size: 1.05rem;
  margin-bottom: 0.75rem;
  z-index: 2;
  text-shadow: 0 4px 18px rgba(0,0,0,0.35);
`;

const RightStack = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
`;

export { Container, Overlay, Title, Button, SecondaryButton, ButtonGroup, Content, Subtitle, RightStack };
