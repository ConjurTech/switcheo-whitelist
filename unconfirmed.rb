require 'net/http'
require 'json'
require 'csv'

uri = URI('https://us17.api.mailchimp.com/3.0/lists/604b9be16e/members?status=pending&count=2000&offset=0&fields=members.merge_fields,members.email_address,members.timestamp_signup,total_items')
req = Net::HTTP::Get.new(uri)
req.basic_auth 'username', ''

res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) {|http|
  http.request(req)
}

items = JSON.parse(res.body)['members']
CSV.open("unconfirmed.csv", "wb") do |write|
  items.each do |item|
    write << [item['email_address'], item['merge_fields']['NEOADDR'], item['timestamp_signup']]
  end
end
