import Student from '../models/Student';

export default async (req, res, next) => {
  const student = await Student.findByPk(req.params.id);

  if (!student)
    return res.status(400).json({ error: 'Student does not exist' });

  return next();
};
