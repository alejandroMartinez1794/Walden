import { validateId } from '../../validators/middleware/validate.js';

describe('validateId middleware', () => {
  const runValidation = (params) => {
    const req = { params };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    validateId(req, res, next);
    return { req, res, next };
  };

  test.each([
    ['mixed hexadecimal ObjectId', '507f1f77bcf86cd799439011'],
    ['numeric-only ObjectId', '123456789012345678901234'],
    ['alphabetic hexadecimal ObjectId', 'abcdefabcdefabcdefabcdef'],
  ])('accepts %s', (_description, id) => {
    const { res, next } = runValidation({ id });

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test.each([
    ['non-hexadecimal characters', 'zzzzzzzzzzzzzzzzzzzzzzzz'],
    ['too-short identifier', '507f1f77bcf86cd79943901'],
    ['missing identifier', undefined],
  ])('rejects %s', (_description, id) => {
    const { res, next } = runValidation(id === undefined ? {} : { id });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'ID inválido',
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test.each(['alertId', 'logId'])('validates named route parameter %s', (paramName) => {
    const { res, next } = runValidation({ [paramName]: '123456789012345678901234' });

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
