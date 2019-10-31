import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class AnswerHelpOrderMail {
  get key() {
    return 'AnswerHelpOrderMail';
  }

  async handle({ data }) {
    const { helpOrder } = data;
    const { question, answer, answer_at } = helpOrder;

    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Sua pergunta foi respondida!',
      template: 'answerHelpOrder',
      context: {
        question,
        answer,
        answer_at: format(parseISO(answer_at), "dd/MM/yyyy' - 'HH:mm"),
      },
    });
  }
}

export default new AnswerHelpOrderMail();
