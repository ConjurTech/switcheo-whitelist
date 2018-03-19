require 'csv'

name = ARGV[0]
prev = ARGV[1]
curr = ARGV[2]

CSV.open("#{name}_in_prev_not_in_curr.csv", "wb") do |write|
  compare = CSV.read(curr).map(&:first)
  CSV.foreach(prev) do |row|
    write << row unless compare.include? row[0]
  end
end

CSV.open("#{name}_in_curr_not_in_prev.csv", "wb") do |write|
  compare = CSV.read(prev).map(&:first)
  CSV.foreach(curr) do |row|
    write << row unless compare.include? row[0]
  end
end
