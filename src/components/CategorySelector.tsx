import * as LucideIcons from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { Category } from '../data/categories';

interface CategorySelectorProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
  onLongPress: (categoryId: string) => void;
  onAddNew: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedIds,
  onToggle,
  onLongPress,
  onAddNew,
}) => {
  const { colors } = useThemeContext();
  const f = theme.fontFamily;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text, fontFamily: f }]}>Kategoriler (Birden fazla seçebilirsiniz)</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { borderColor: colors.primary, backgroundColor: colors.categorySelectedBackground },
              ]}
              onPress={() => onToggle(category.id)}
              onLongPress={() => onLongPress(category.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {(() => {
                  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Package;
                  return (
                    <IconComponent
                      size={24}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  );
                })()}
              </View>
              <Text 
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                style={[
                styles.categoryName,
                { color: colors.textSecondary, fontFamily: f },
                isSelected && { color: colors.primary, fontWeight: theme.fontWeight.bold },
              ]}>
                {category.name}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <LucideIcons.Check size={14} color={colors.buttonPrimaryText} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.addNewCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
          onPress={onAddNew}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <LucideIcons.Plus size={32} color={colors.primary} />
          </View>
          <Text style={[styles.addNewText, { color: colors.primary, fontFamily: f }]}>Yeni Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    width: '31.3%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
    width: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: theme.borderRadius.full,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewCard: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    width: '31.3%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addNewText: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
});
