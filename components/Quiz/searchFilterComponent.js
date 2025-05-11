import React, { useState, useEffect } from 'react';
import { TextInput, Text, View, StyleSheet, Switch } from 'react-native';
import {Picker} from '@react-native-picker/picker';
const SearchFilterComponent = ({
  quizzes,
  setFilteredQuizzes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTags, setSelectedTags] = useState({}); // Object to hold selected tags (tag: true/false)

  // Handle search query change
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    filterQuizzes(text, selectedCategory, selectedStatus, selectedTags);
  };

  // Filter quizzes based on search, category, status, and tags
  const filterQuizzes = (query, category, status, tags) => {
    const filtered = quizzes.filter((quiz) => {
      const matchQuery =
        quiz.title.toLowerCase().includes(query.toLowerCase()) ||
        quiz.description.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category ? quiz.category.includes(category) : true;
      const matchStatus = status ? quiz.is_active.toString() === status : true;
      const matchTags = Object.keys(tags).length > 0
        ? Object.keys(tags).every((tag) => tags[tag] && quiz.tags.includes(tag))
        : true;

      return matchQuery && matchCategory && matchStatus && matchTags;
    });

    setFilteredQuizzes(filtered); // Set filtered quizzes
  };

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    filterQuizzes(searchQuery, value, selectedStatus, selectedTags);
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    filterQuizzes(searchQuery, selectedCategory, value, selectedTags);
  };

  // Handle tags change (using Switch for multiple tags)
  const handleTagChange = (tag) => {
    setSelectedTags((prevTags) => {
      const updatedTags = { ...prevTags, [tag]: !prevTags[tag] };
      filterQuizzes(searchQuery, selectedCategory, selectedStatus, updatedTags);
      return updatedTags;
    });
  };

  return (
    <View style={styles.filterContainer}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title or description"
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {/* Category Filter */}
      <Text style={styles.filterLabel}>Category</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={handleCategoryChange}
        style={styles.filterSelect}
      >
        <Picker.Item label="All Categories" value="" />
        <Picker.Item label="Category 1" value="Category 1" />
        <Picker.Item label="Category 2" value="Category 2" />
        {/* Add more categories dynamically if needed */}
      </Picker>

      {/* Status Filter */}
      <Text style={styles.filterLabel}>Status</Text>
      <Picker
        selectedValue={selectedStatus}
        onValueChange={handleStatusChange}
        style={styles.filterSelect}
      >
        <Picker.Item label="All Statuses" value="" />
        <Picker.Item label="Active" value="true" />
        <Picker.Item label="Inactive" value="false" />
      </Picker>

      {/* Tags Filter with Switch */}
      <Text style={styles.filterLabel}>Tags</Text>
      <View style={styles.tagsContainer}>
        {["Tag 1", "Tag 2", "Tag 3"].map((tag, index) => (
          <View key={index} style={styles.tagItem}>
            <Text>{tag}</Text>
            <Switch
              value={selectedTags[tag] || false}
              onValueChange={() => handleTagChange(tag)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 5,
  },
  filterSelect: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
});

export default SearchFilterComponent;
