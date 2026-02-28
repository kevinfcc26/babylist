import type { BabyList } from '../../types/list'

interface BabyShowerBannerProps {
  list: BabyList
}

export default function BabyShowerBanner({ list }: BabyShowerBannerProps) {
  return (
    <div className="text-center py-2">
      <h1
        className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
      >
        Baby Shower
      </h1>

      <div className="max-w-xs mx-auto space-y-2 text-gray-600 text-sm leading-relaxed">
        <p className="text-base font-semibold text-gray-700">
          ¡Hola! Soy el bebé {list.babyName} 🤍
        </p>
        <p>
          Esta es mi lista de baby shower. Si me quieres consentir,
          puedes agregar aquí el regalo que me vas a dar —
          ¡así evitamos que se repitan! 🎁
        </p>
        <p className="font-medium" style={{ color: '#5a8a5a' }}>
          ¡Los esperamos con mucho amor! ❤️
        </p>
      </div>
    </div>
  )
}
