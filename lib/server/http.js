export function json(res, status, data){
  res.statusCode = status;
  res.setHeader('content-type','application/json');
  res.end(JSON.stringify(data));
}

export function ok(res, data){ return json(res, 200, data); }
export function badRequest(res, message){ return json(res, 400, { code: "BAD_REQUEST", message }); }
export function notAllowed(res){ return json(res, 405, { code: "METHOD_NOT_ALLOWED" }); }

export function validationError(res, issues){
  // issues: array of { path, message }
  return json(res, 422, { code: "VALIDATION_ERROR", issues });
}

export function serverError(res, message){
  return json(res, 500, { code: "SERVER_ERROR", message });
}

export function fromZodError(res, err){
  const issues = (err.issues || []).map(i => ({
    path: i.path.join('.'),
    message: i.message
  }));
  return validationError(res, issues);
}
