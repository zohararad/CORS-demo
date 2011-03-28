Cors.controllers :data do

  before do
    response.headers["Access-Control-Allow-Origin"] = "http://tasks:3000"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers['Access-Control-Allow-Headers'] = "Content-Type"
    response.headers['Access-Control-Max-Age'] = (60 * 60 * 6).to_s
    response.headers['Access-Control-Allow-Credentials'] = 'false'
  end

  get :list do
  end

  post :save do
    return {:status => 200, :response => 'OK'}.to_json
  end
  
end