import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class NewRegistrationMail {
  get key() {
    return 'NewRegistrationMail';
  }

  async handle({ data }) {
    const { student, plan, registration } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Nova matrícula na GymPoint!',
      template: 'newRegistration',
      context: {
        name: student.name,
        planName: plan.title,
        startDate: format(parseISO(registration.start_date), 'dd/MM/yyyy'),
        endDate: format(parseISO(registration.end_date), 'dd/MM/yyyy'),
        mensalPrice: plan.price,
        fullPrice: registration.price,
      },
    });
  }
}

export default new NewRegistrationMail();
