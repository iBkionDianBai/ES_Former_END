import { sleep } from 'ut2';
import ImageBg from './image/ValBack.png';
import ImagePuzzle from './image/ValPing.png'; 

export const getCaptcha = async () => {
    await sleep();
    return {
      bgUrl: ImageBg,
      puzzleUrl: ImagePuzzle
    };
  };
  
  export const verifyCaptcha = async (data: { x: number }) => {
    await sleep();
    if (data?.x && data.x > 80 && data.x < 100) {
      return Promise.resolve();
    }
    return Promise.reject();
  };
  
  export default {getCaptcha, verifyCaptcha};