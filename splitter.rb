require 'csv'

path = ARGV[0]

CSV.open("t1new.csv", "wb") do |t1|
  CSV.open("t2new.csv", "wb") do |t2|
    CSV.foreach(path).with_index do |row, index|
      if index < 5000
        t1 << [row[0]] 
      else
        t2 << [row[0]]
      end
    end
  end
end
