export interface Category {
  id: string;
  name: string;
  icon: string;
  words: string[];
  isCustom?: boolean;
}

export const categories: Category[] = [
  {
    id: 'animals',
    name: 'Hayvanlar',
    icon: 'Cat',
    words: [
      'Aslan', 'Kaplan', 'Fil', 'Zürafa', 'Kedi', 'Köpek', 'Yunus', 'Kartal', 'Penguen', 'Kanguru',
      'Panda', 'Koala', 'Timsah', 'Yılan', 'Ayı', 'Kurt', 'Tavşan', 'Sincap', 'Maymun', 'Zebra',
      'Gergedan', 'Su Aygırı', 'Deve', 'At', 'İnek', 'Koyun', 'Keçi', 'Tavuk', 'Ördek', 'Kaz',
      'Hindi', 'Papağan', 'Muhabbet Kuşu', 'Kanarya', 'Baykuş', 'Yarasa', 'Kirpi', 'Kaplumbağa',
      'Bukalemun', 'Ahtapot', 'Denizanası', 'Köpekbalığı', 'Balina', 'Fok', 'Kunduz', 'Rakun',
      'Tilki', 'Geyik', 'Antilop', 'Bizon'
    ],
  },
  {
    id: 'professions',
    name: 'Meslekler',
    icon: 'Briefcase',
    words: [
      'Doktor', 'Mühendis', 'Öğretmen', 'Polis', 'Avukat', 'Hemşire', 'Pilot', 'Aşçı', 'İtfaiyeci',
      'Berber', 'Terzi', 'Şoför', 'Çiftçi', 'Mimar', 'Yazar', 'Ressam', 'Müzisyen', 'Oyuncu',
      'Veteriner', 'Diş Hekimi', 'Eczacı', 'Kasap', 'Fırıncı', 'Marangoz', 'Elektrikçi',
      'Tesisatçı', 'Kurye', 'Güvenlik Görevlisi', 'Bankacı', 'Muhasebeci', 'Sekreter', 'Gazeteci',
      'Fotoğrafçı', 'Yönetmen', 'Hakim', 'Savcı', 'Psikolog', 'Diyetisyen', 'Antrenör', 'Hakem',
      'Kaptan', 'Hostes', 'Madenci', 'Balıkçı', 'Bahçıvan', 'Temizlikçi', 'Emlakçı', 'Yazılımcı'
    ],
  },
  {
    id: 'cities',
    name: 'Şehirler',
    icon: 'MapPin',
    words: [
      'İstanbul', 'Ankara', 'İzmir', 'Londra', 'Paris', 'New York', 'Tokyo', 'Berlin', 'Roma',
      'Moskova', 'Madrid', 'Barcelona', 'Amsterdam', 'Viyana', 'Prag', 'Budapeşte', 'Atina',
      'Kahire', 'Dubai', 'Bursa', 'Kırşehir', 'Akhisar', 'Edremit', 'Tiran', 'Üsküp', 'Priştine',
      'Virginia Beach'
    ],
  },
  {
    id: 'foods',
    name: 'Yemekler',
    icon: 'UtensilsCrossed',
    words: [
      'Mantı', 'Kebap', 'Döner', 'Lahmacun', 'Pide', 'Pizza', 'Hamburger', 'Makarna', 'Sushi',
      'Köfte', 'Dolma', 'Sarma', 'Börek', 'Menemen', 'Karnıyarık', 'İmam Bayıldı', 'Hünkar Beğendi',
      'Ali Nazik', 'Tas Kebabı', 'Kuru Fasulye', 'Pilav', 'Mercimek Çorbası', 'Tarhana',
      'Ezogelin', 'Çiğ Köfte', 'Kokoreç', 'Tantuni', 'İskender', 'Adana Kebap', 'Urfa Kebap',
      'Beyti', 'Cağ Kebabı', 'Kumpir', 'Gözleme', 'Tost', 'Sandviç', 'Salata', 'Patates Kızartması',
      'Tavuk Sote', 'Balık Ekmek', 'Hamsi Tava', 'Kalamar', 'Karides', 'Baklava', 'Künefe',
      'Sütlaç', 'Kazandibi', 'Tavuk Göğsü', 'Aşure', 'Güllaç'
    ],
  },
  {
    id: 'movies-shows',
    name: 'Diziler ve Filmler',
    icon: 'Film',
    words: [
      'Kurtlar Vadisi', 'Ezel', 'Aşk-ı Memnu', 'Behzat Ç', 'Gibi', 'Game of Thrones', 'Breaking Bad',
      'Stranger Things', 'The Office', 'La Casa de Papel', 'Squid Game', 'The Godfather', 'Fight Club',
      'Matrix', 'Inception', 'Interstellar', 'Lord of the Rings', 'Sherlock', 'LOST', 'Death Note',
      'Harry Potter', 'Star Wars', 'Avengers', 'Batman', 'Joker', 'Titanic', 'Forrest Gump', 'Seven',
      'Braveheart', 'G.O.R.A', 'A.R.O.G', 'Yeşil Yol', 'Geleceğe Dönüş', 'Memento', 'Dune',
      'Soysuzlar Çetesi', 'The Wolf of Wall Street', 'Oppenheimer', 'Kader'
    ],
  },
  {
    id: 'celebrities',
    name: 'Ünlüler',
    icon: 'Star',
    words: [
      'Tarkan', 'Cem Yılmaz', 'Acun Ilıcalı', 'Sezen Aksu', 'Müslüm Gürses', 'Haluk Bilginer',
      'Kıvanç Tatlıtuğ', 'Kenan İmirzalıoğlu', 'Beren Saat', 'Serenay Sarıkaya', 'Brad Pitt',
      'Leonardo DiCaprio', 'Tom Cruise', 'Johnny Depp', 'Robert Downey Jr.', 'Scarlett Johansson',
      'Rihanna', 'Shakira', 'Michael Jackson', 'Adele', 'Taylor Swift', 'Elon Musk', 'Bill Gates',
      'Mark Zuckerberg', 'Steve Jobs', 'Jeff Bezos', 'Michael Jordan', 'Kobe Bryant', 'LeBron James'
    ],
  },
  {
    id: 'objects',
    name: 'Nesneler',
    icon: 'Package',
    words: [
      'Telefon', 'Bilgisayar', 'Televizyon', 'Saat', 'Gözlük', 'Kalem', 'Defter', 'Kitap', 'Çanta',
      'Ayakkabı', 'Terlik', 'Şemsiye', 'Anahtar', 'Cüzdan', 'Bardak', 'Tabak', 'Çatal', 'Kaşık',
      'Bıçak', 'Tencere', 'Tava', 'Ütü', 'Süpürge', 'Çamaşır Makinesi', 'Bulaşık Makinesi',
      'Buzdolabı', 'Fırın', 'Mikrodalga', 'Lamba', 'Ampul', 'Ayna', 'Tarak', 'Diş Fırçası', 'Sabun',
      'Şampuan', 'Havlu', 'Yastık', 'Yorgan', 'Battaniye', 'Koltuk', 'Sandalye', 'Masa', 'Dolap',
      'Halı', 'Perde', 'Vazo', 'Çiçek', 'Saksı', 'Makas', 'Bant'
    ],
  },
  {
    id: 'footballers',
    name: 'Futbolcular',
    icon: 'Trophy',
    words: [
      'Messi', 'Ronaldo', 'Neymar', 'Mbappe', 'Haaland', 'Salah', 'De Bruyne', 'Benzema',
      'Lewandowski', 'Kane', 'Modric', 'Kroos', 'Vinicius Jr', 'Bellingham', 'Muslera', 'Icardi',
      'Dzeko', 'Tadic', 'Arda Güler', 'Hakan Çalhanoğlu', 'Merih Demiral', 'Kerem Aktürkoğlu',
      'Ferdi Kadıoğlu', 'Buffon', 'Casillas', 'Xavi', 'Iniesta', 'Pirlo', 'Gerrard', 'Lampard',
      'Drogba', 'Eto\'o', 'Alex de Souza', 'Hagi', 'Roberto Carlos', 'Sneijder', 'Quaresma'
    ],
  },
  {
    id: 'singers',
    name: 'Şarkıcılar',
    icon: 'Music',
    words: [
      'Tarkan', 'Sezen Aksu', 'Sertab Erener', 'Kenan Doğulu', 'Mabel Matiz', 'Sıla', 'Edis',
      'Hadise', 'Murat Boz', 'Hande Yener', 'Mustafa Sandal', 'Zeynep Bastık', 'Aleyna Tilki',
      'Simge Sağın', 'Bengü', 'Ajda Pekkan', 'Ebru Gündeş', 'Levent Yüksel', 'Şebnem Ferah',
      'Haluk Levent', 'Barış Manço', 'Cem Karaca', 'Erkin Koray', 'Hayko Cepkin', 'Emre Aydın',
      'Fatma Turgut', 'Kaan Tangöze', 'Can Bonomo', 'Cem Adrian', 'Melike Şahin', 'Ezhel',
      'Şanışer', 'Lvbel C5', 'The Weeknd', 'Lady Gaga', 'Katy Perry', 'Bruno Mars', 'Billie Eilish',
      'Jennifer Lopez', 'Kendrick Lamar', 'Eminem', 'Drake'
    ],
  },
  {
    id: 'historical',
    name: 'Tarihi Karakterler',
    icon: 'Landmark',
    words: [
      'Mustafa Kemal Atatürk', 'Fatih Sultan Mehmet', 'Kanuni Sultan Süleyman', 'Yavuz Sultan Selim',
      'Osman Bey', 'Abdülhamid Han', 'Mete Han', 'Attila', 'Cengiz Han', 'Timur', 'Alparslan',
      'Mimar Sinan', 'Mevlana', 'Yunus Emre', 'Hacı Bayram Veli', 'Nasreddin Hoca', 'Napolyon',
      'Hitler', 'Stalin', 'Lenin', 'Churchill', 'Kennedy', 'Büyük İskender', 'Kleopatra',
      'Alan Turing', 'Einstein', 'Newton', 'Tesla', 'Edison', 'Darwin', 'Galileo', 'Shakespeare'
    ],
  },
  {
    id: 'clash-royale',
    name: 'Clash Royale',
    icon: 'Crown',
    words: [
      'İskeletler', 'Buz Ruhu', 'Goblinler', 'Mızraklı Goblinler', 'Yarasalar', 'Ateş Ruhu',
      'Minyonlar', 'Okçular', 'Şövalye', 'İskelet Ejderhalar', 'Bombacı', 'Top', 'Tesla', 'Havan',
      'Barbarlar', 'Elit Barbarlar', 'Kraliyet Devi', 'Serseriler', 'Elektro Ruh', 'İyileştirme Ruhu',
      'Buz Golemi', 'Mezar Taşı', 'Mega Dalkavuk', 'Dart Goblini', 'Deprem', 'İksir Golemi',
      'Silahşor', 'Şifacı', 'Domuz Binicisi', 'Mini PEKKA', 'Valkür', 'Koçbaşı', 'Uçan Makine',
      'Elektro Şokçular', 'Fırın', 'Bomba Kulesi', 'Goblin Kulübesi', 'Dev', 'Kraliyet Domuzları',
      'Goblin Kafesi', 'Büyücü', 'Üç Silahşor', 'Alev Topu', 'Oklar', 'Çarpma', 'Roket', 'Yıldırım',
      'Tomruk', 'Barbar Varili', 'Kasırga', 'Klon', 'Öfke', 'Goblin Fıçısı', 'Korumalar',
      'İskelet Ordusu', 'Yavru Ejderha', 'Kara Prens', 'Avcı', 'Cadı', 'Balon', 'Prens',
      'Elektro Ejderha', 'Dev İskelet', 'PEKKA', 'Kraliyet Hayaleti', 'Haydut', 'Madenci', 'Prenses',
      'Buz Büyücüsü', 'Elektro Büyücü', 'Cehennem Ejderhası', 'Gece Cadısı', 'Büyülü Okçu',
      'Oduncu', 'Balıkçı', 'Koç Binicisi', 'Mega Şövalye', 'Lav Tazısı', 'Kıvılcım', 'Mezarlık',
      'X-Yayı', 'Cehennem Kulesi', 'İksir Toplayıcı', 'Goblin Dev', 'Elektro Dev', 'Altın Şövalye',
      'İskelet Kral', 'Okçu Kraliçe', 'Kudretli Madenci', 'Keşiş', 'Küçük Prens', 'Anka Kuşu',
      'Cellat', 'Atıcı', 'Golem', 'Top Arabası', 'Kar Topu'
    ],
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};

export const getCategoriesByIds = (ids: string[]): Category[] => {
  return categories.filter((cat) => ids.includes(cat.id));
};
