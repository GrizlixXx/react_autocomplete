import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Person } from '../../types/Person';

interface Props {
  people?: Person[];
  delay?: number;
  onSelected?: (person: Person | null) => void;
}

export const ComboBox: React.FC<Props> = ({
  people = [],
  delay = 300,
  onSelected,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const previousQueryRef = useRef('');

  useEffect(() => {
    const trimmedValue = inputValue.trim();

    if (trimmedValue === previousQueryRef.current) {
      return undefined;
    }

    previousQueryRef.current = trimmedValue;

    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(trimmedValue);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [inputValue, delay]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = debouncedValue.toLowerCase();

    if (!normalizedQuery) {
      return people;
    }

    return people.filter(person =>
      person.name.toLowerCase().includes(normalizedQuery),
    );
  }, [debouncedValue, people]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setInputValue(nextValue);
    setIsOpen(true);

    if (selectedPerson && nextValue !== selectedPerson.name) {
      setSelectedPerson(null);
      onSelected?.(null);
    }
  };

  const handleSelect = (person: Person) => {
    setSelectedPerson(person);
    setInputValue(person.name);
    setDebouncedValue(person.name.trim());
    previousQueryRef.current = person.name.trim();
    setIsOpen(false);
    onSelected?.(person);
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  return (
    <div className={`dropdown ${isOpen ? 'is-active' : ''}`}>
      <div className="dropdown-trigger" style={{ width: '300px' }}>
        <input
          type="text"
          value={inputValue}
          className="input"
          data-cy="search-input"
          placeholder="Enter a part of the name"
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
        />
      </div>

      {isOpen && (
        <div className="dropdown-menu" role="menu" style={{ width: '300px' }}>
          <div className="dropdown-content" data-cy="suggestions-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(person => (
                <button
                  key={person.slug}
                  type="button"
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => handleSelect(person)}
                >
                  <span
                    className={
                      person.sex === 'm' ? 'has-text-link' : 'has-text-danger'
                    }
                  >
                    {person.name}
                  </span>
                </button>
              ))
            ) : (
              <div className="dropdown-item" data-cy="no-suggestions-message">
                No matching suggestions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
