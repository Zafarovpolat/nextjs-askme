'use client'

import { useState, useRef, useEffect } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  disabled?: boolean
  icon?: React.ReactNode
  /** Доп. класс корневого контейнера (например custom-select--leaders-filter). */
  className?: string
  /** Показать крестик сброса, если value !== defaultClearValue */
  clearable?: boolean
  /** Значение по умолчанию (крестик скрыт, пока выбрано оно) */
  defaultClearValue?: string
  /** Свой обработчик сброса вместо onChange(defaultClearValue) */
  onClear?: () => void
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  icon,
  className,
  clearable = false,
  defaultClearValue = '',
  onClear,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Закрытие по клику вне компонента
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const selectedOption = options.find((o) => o.value === value)

  const handleToggle = () => {
    if (!disabled) setIsOpen((prev) => !prev)
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const showClear = clearable && !disabled && value !== defaultClearValue

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    if (onClear) {
      onClear()
    } else {
      onChange(defaultClearValue)
    }
  }

  return (
    <div
      ref={containerRef}
      className={[
        'custom-select',
        isOpen ? 'custom-select--open' : '',
        disabled ? 'custom-select--disabled' : '',
        !icon ? 'custom-select--no-icon' : '',
        showClear ? 'custom-select--has-clear' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Иконка слева (абсолютная) */}
      {icon && <span className="custom-select__icon">{icon}</span>}

      {/* Кнопка-триггер */}
      <button
        type="button"
        className="custom-select__trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`custom-select__value ${!selectedOption ? 'custom-select__value--placeholder' : ''}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Стрелка */}
        <svg
          className="custom-select__arrow"
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {showClear && (
        <button
          type="button"
          className="custom-select__clear"
          aria-label="Сбросить"
          onClick={handleClear}
        >
          <svg
            className="custom-select__clear-icon"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden
          >
            <path
              d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {/* Выпадающий список */}
      {isOpen && (
        <div className="custom-select__dropdown" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`custom-select__option ${option.value === value ? 'custom-select__option--selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
