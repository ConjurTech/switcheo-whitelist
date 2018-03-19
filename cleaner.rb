require 'csv'

path = ARGV[0]

CSV.open("clean.csv", "wb") do |write|
  dirty = CSV.read(path).sort_by { |arr| DateTime.parse(arr[2]) }
  dirty.each do |row|
    clean_address = row[1].delete(' ').delete('.')
    clean_address = clean_address.slice(clean_address.index("A")..-1)
    write << [clean_address, row[2]] if clean_address.length == 34
  end
end
